-- Create interviewer_surveys table to store interview survey data
CREATE TABLE public.interviewer_surveys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  interviewer_name TEXT NOT NULL,
  consumer_name TEXT,
  survey_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.interviewer_surveys ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is for interview data collection)
CREATE POLICY "Anyone can view interviewer surveys" 
ON public.interviewer_surveys 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create interviewer surveys" 
ON public.interviewer_surveys 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update interviewer surveys" 
ON public.interviewer_surveys 
FOR UPDATE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_interviewer_surveys_updated_at
BEFORE UPDATE ON public.interviewer_surveys
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();