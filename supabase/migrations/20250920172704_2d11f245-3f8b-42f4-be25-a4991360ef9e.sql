-- Create table for survey responses (one per consumer)
CREATE TABLE public.survey_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  consumer_id TEXT NOT NULL, -- Sequential number like "Consumer #1", "Consumer #2"
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  total_steps INTEGER NOT NULL DEFAULT 11,
  completed_steps INTEGER NOT NULL DEFAULT 0,
  classified_segments JSONB, -- Store segment classifications
  primary_segment TEXT, -- Main market segment 
  confidence_score NUMERIC(3,2), -- Confidence in segment classification
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for individual question answers
CREATE TABLE public.question_answers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  response_id UUID NOT NULL REFERENCES public.survey_responses(id) ON DELETE CASCADE,
  step_id INTEGER NOT NULL,
  question_id TEXT NOT NULL,
  question_type TEXT NOT NULL, -- 'single-choice', 'multiple-choice', 'textarea'
  answer_value JSONB NOT NULL, -- Store answer as JSON (string for single, array for multiple)
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_answers ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (no authentication required for this use case)
CREATE POLICY "Survey responses are publicly accessible" 
ON public.survey_responses 
FOR ALL 
USING (true)
WITH CHECK (true);

CREATE POLICY "Question answers are publicly accessible" 
ON public.question_answers 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_survey_responses_consumer_id ON public.survey_responses(consumer_id);
CREATE INDEX idx_survey_responses_created_at ON public.survey_responses(created_at);
CREATE INDEX idx_question_answers_response_id ON public.question_answers(response_id);
CREATE INDEX idx_question_answers_step_question ON public.question_answers(step_id, question_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_survey_responses_updated_at
  BEFORE UPDATE ON public.survey_responses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to generate sequential consumer IDs
CREATE OR REPLACE FUNCTION public.generate_consumer_id()
RETURNS TEXT AS $$
DECLARE
  next_number INTEGER;
BEGIN
  -- Get the next consumer number
  SELECT COALESCE(MAX(CAST(REPLACE(consumer_id, 'Consumer #', '') AS INTEGER)), 0) + 1
  INTO next_number
  FROM public.survey_responses;
  
  RETURN 'Consumer #' || next_number;
END;
$$ LANGUAGE plpgsql SET search_path = public;