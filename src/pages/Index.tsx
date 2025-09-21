import { useState, useCallback, useRef, useEffect } from "react";
import { ProgressIndicator } from "@/components/ProgressIndicator";
import { SurveyNavigation } from "@/components/SurveyNavigation";
import { StepQuestions } from "@/components/StepQuestions";
import { DashboardButton } from "@/components/DashboardButton";
import { classifyRespondent } from "@/lib/segmentationMapping";
import { marketResearchSurvey } from "@/lib/surveyData";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasCompletedSurvey, setHasCompletedSurvey] = useState(false);
  const mainContentRef = useRef<HTMLElement>(null);

  // Mock completed survey state for demonstration
  useEffect(() => {
    // You can implement real checking logic here if needed
    setHasCompletedSurvey(false);
  }, []);

  const currentStep = marketResearchSurvey.steps[currentStepIndex];
  const isLastStep = currentStepIndex === marketResearchSurvey.steps.length - 1;
  const canGoPrevious = currentStepIndex > 0;

  // Check if all required questions in current step are answered
  const canGoNext = currentStep.questions.every(question => {
    if (!question.required) return true;
    const answer = answers[question.id];
    return answer !== undefined && answer !== "" && answer !== null;
  });

  const handleAnswer = useCallback((answer: any, questionId: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  }, []);

  const handleNext = () => {
    if (!isLastStep) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Classify market segment for demonstration
      const classifications = classifyRespondent(answers);
      const primarySegment = classifications.length > 0 ? classifications[0].segment : 'Unknown';
      
      console.log('Survey completed:', { answers, classifications, primarySegment });
      
      // Show success message
      toast({
        title: "Survey Completed!",
        description: `Thank you for your feedback! You are classified as: ${primarySegment}`,
      });
      
      // Update state to show dashboard button
      setHasCompletedSurvey(true);
      
      // Reset survey after delay
      setTimeout(() => {
        setCurrentStepIndex(0);
        setAnswers({});
        setIsSubmitting(false);
      }, 3000);
      
    } catch (error) {
      console.error('Error saving survey:', error);
      toast({
        title: "Error",
        description: "Failed to save survey. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Enhanced Header */}
      <div className="relative bg-gradient-to-br from-card via-card to-muted/20 border-b border-border/50">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.05),transparent_50%)] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.03),transparent_50%)] pointer-events-none"></div>
        
        <div className="relative max-w-4xl mx-auto px-6 py-10">
          <div className="space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-foreground leading-tight tracking-tight">
                {currentStep.title}
              </h1>
              <p className="text-base text-muted-foreground/90 leading-relaxed max-w-2xl">
                {currentStep.description}
              </p>
            </div>
          </div>
          
          {/* Enhanced Progress Section */}
          <div className="mt-8 space-y-3">
            <ProgressIndicator currentStep={currentStepIndex + 1} totalSteps={marketResearchSurvey.steps.length} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main ref={mainContentRef} className="max-w-4xl mx-auto px-6 py-8">
        <StepQuestions questions={currentStep.questions} answers={answers} onAnswer={handleAnswer} />
      </main>

      {/* Dashboard Button - Show after first survey completion */}
      {hasCompletedSurvey && (
        <div className="fixed top-6 right-6 z-50">
          <DashboardButton />
        </div>
      )}

      {/* Fixed Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border">
        <div className="max-w-4xl mx-auto">
          <SurveyNavigation 
            onPrevious={handlePrevious} 
            onNext={handleNext} 
            onSubmit={handleSubmit} 
            canGoPrevious={canGoPrevious} 
            canGoNext={canGoNext} 
            isLastQuestion={isLastStep} 
            isSubmitting={isSubmitting} 
          />
        </div>
      </div>

      {/* Bottom padding to account for fixed navigation */}
      <div className="h-20"></div>
    </div>
  );
};

export default Index;