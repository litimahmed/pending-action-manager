import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";

export type QuestionType = 
  | "text" 
  | "textarea" 
  | "single-choice" 
  | "multiple-choice" 
  | "rating";

export interface Question {
  id: string;
  type: QuestionType;
  title: string;
  description?: string;
  required?: boolean;
  options?: string[];
  placeholder?: string;
}

interface QuestionCardProps {
  question: Question;
  onAnswer: (answer: any) => void;
  currentAnswer?: any;
}

export const QuestionCard = ({ 
  question, 
  onAnswer, 
  currentAnswer 
}: QuestionCardProps) => {
  const [answer, setAnswer] = useState(currentAnswer || "");

  const handleAnswerChange = (value: any) => {
    setAnswer(value);
    onAnswer(value);
  };

  const renderInput = () => {
    switch (question.type) {
      case "text":
        return (
          <Input
            type="text"
            placeholder={question.placeholder || "Enter your answer..."}
            value={answer}
            onChange={(e) => handleAnswerChange(e.target.value)}
            className="h-11 px-3 text-sm bg-input border border-input-border rounded-md focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
          />
        );

      case "textarea":
        return (
          <Textarea
            placeholder={question.placeholder || "Enter your detailed response..."}
            value={answer}
            onChange={(e) => handleAnswerChange(e.target.value)}
            className="min-h-[100px] px-3 py-2 text-sm bg-input border border-input-border rounded-md focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors resize-none"
          />
        );

      case "single-choice":
        return (
          <RadioGroup value={answer} onValueChange={handleAnswerChange}>
            <div className="space-y-3">
              {question.options?.map((option, index) => (
                <div 
                  key={index} 
                  className="flex items-start space-x-3 p-3 rounded-md border border-border hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleAnswerChange(option);
                  }}
                >
                  <RadioGroupItem 
                    value={option} 
                    id={`option-${index}`}
                    className="mt-0.5"
                  />
                  <Label 
                    htmlFor={`option-${index}`}
                    className="text-sm text-foreground cursor-pointer flex-1 leading-relaxed pointer-events-none"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        );

      case "multiple-choice":
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <div 
                key={index} 
                className="flex items-start space-x-3 p-3 rounded-md border border-border hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const newAnswer = answer || [];
                  const isChecked = newAnswer.includes(option);
                  if (!isChecked) {
                    handleAnswerChange([...newAnswer, option]);
                  } else {
                    handleAnswerChange(newAnswer.filter((a: string) => a !== option));
                  }
                }}
              >
                <Checkbox
                  id={`checkbox-${index}`}
                  checked={answer.includes && answer.includes(option)}
                  onCheckedChange={(checked) => {
                    const newAnswer = answer || [];
                    if (checked) {
                      handleAnswerChange([...newAnswer, option]);
                    } else {
                      handleAnswerChange(newAnswer.filter((a: string) => a !== option));
                    }
                  }}
                  className="mt-0.5"
                />
                <Label 
                  htmlFor={`checkbox-${index}`}
                  className="text-sm text-foreground cursor-pointer flex-1 leading-relaxed pointer-events-none"
                >
                  {option}
                </Label>
              </div>
            ))}
          </div>
        );

      case "rating":
        return (
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <Button
                key={rating}
                variant={answer === rating ? "default" : "outline"}
                size="sm"
                onClick={() => handleAnswerChange(rating)}
                className="w-10 h-10 text-sm font-medium"
              >
                {rating}
              </Button>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
      <div className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground leading-tight">
            {question.title}
            {question.required && (
              <span className="text-destructive ml-1">*</span>
            )}
          </h3>
          
          {question.description && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {question.description}
            </p>
          )}
        </div>

        <div className="pt-2">
          {renderInput()}
        </div>
      </div>
    </div>
  );
};