import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StepQuestions } from "@/components/StepQuestions";
import { SurveyNavigation } from "@/components/SurveyNavigation";
import { ProgressIndicator } from "@/components/ProgressIndicator";
import { SurveyHeader } from "@/components/SurveyHeader";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { marketResearchSurvey } from "@/lib/surveyData";
// Force cache refresh

export default function Survey() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedSurveys, setSavedSurveys] = useState<any[]>([]);
  const { toast } = useToast();

  // Load saved surveys on component mount
  useEffect(() => {
    loadSavedSurveys();
  }, []);

  const loadSavedSurveys = async () => {
    try {
      const { data, error } = await supabase
        .from('interviewer_surveys')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedSurveys(data || []);
    } catch (error) {
      console.error('Error loading surveys:', error);
    }
  };


  const handleAnswer = (answer: any, questionId: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const canGoNext = () => {
    const currentStepData = marketResearchSurvey.steps[currentStep];
    return currentStepData.questions.every(question => {
      if (!question.required) return true;
      const answer = answers[question.id];
      return answer !== undefined && answer !== "" && answer !== null;
    });
  };

  const handleNext = () => {
    if (currentStep < marketResearchSurvey.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const surveyData = {
        interviewer_name: 'Anonymous',
        consumer_name: 'Consumer',
        survey_data: {
          answers,
          completed_at: new Date().toISOString(),
          steps_completed: currentStep + 1,
          total_steps: marketResearchSurvey.steps.length
        }
      };

      const { error } = await supabase
        .from('interviewer_surveys')
        .insert([surveyData]);

      if (error) throw error;

      toast({
        title: "Survey Submitted Successfully!",
        description: "The interview responses have been saved.",
      });

      // Reset form
      setAnswers({});
      setCurrentStep(0);
      
      // Reload saved surveys
      loadSavedSurveys();

    } catch (error) {
      console.error('Error submitting survey:', error);
      toast({
        title: "Submission Failed",
        description: "Failed to save survey. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentStepData = marketResearchSurvey.steps[currentStep];
  const isLastQuestion = currentStep === marketResearchSurvey.steps.length - 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <SurveyHeader 
        title="Consumer Interview Survey"
        description="Answer all questions to complete the survey"
      />
      
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <ProgressIndicator 
            currentStep={currentStep + 1}
            totalSteps={marketResearchSurvey.steps.length}
          />
          
          <div className="text-sm text-muted-foreground">
            Saved surveys: {savedSurveys.length}
          </div>
        </div>
        
        <div className="mt-4 text-center mb-6">
          <h2 className="text-xl font-semibold text-foreground">
            {currentStepData.title}
          </h2>
        </div>
        
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{currentStepData.title}</CardTitle>
              {currentStepData.description && (
                <p className="text-muted-foreground mt-2">
                  {currentStepData.description}
                </p>
              )}
            </CardHeader>
            <CardContent>
              <StepQuestions
                questions={currentStepData.questions}
                answers={answers}
                onAnswer={handleAnswer}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="sticky bottom-0 bg-background border-t border-border">
        <SurveyNavigation
          onPrevious={currentStep > 0 ? handlePrevious : undefined}
          onNext={!isLastQuestion ? handleNext : undefined}
          onSubmit={isLastQuestion ? handleSubmit : undefined}
          canGoPrevious={currentStep > 0}
          canGoNext={canGoNext()}
          isLastQuestion={isLastQuestion}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}