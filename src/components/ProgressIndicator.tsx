import { Progress } from "@/components/ui/progress";

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
}

export const ProgressIndicator = ({ 
  currentStep, 
  totalSteps, 
  className = "" 
}: ProgressIndicatorProps) => {
  const progressPercentage = ((currentStep - 1) / totalSteps) * 100;

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex justify-between items-center text-sm">
        <span className="text-muted-foreground font-medium">
          Progress
        </span>
        <span className="text-foreground font-semibold">
          {currentStep} of {totalSteps}
        </span>
      </div>
      
      <Progress 
        value={progressPercentage} 
        className="w-full h-2 bg-secondary"
      />
      
      <div className="text-xs text-muted-foreground text-center">
        {Math.round(progressPercentage)}% Complete
      </div>
    </div>
  );
};