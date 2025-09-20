import { QuestionCard, Question } from "./QuestionCard";

interface StepQuestionsProps {
  questions: Question[];
  answers: Record<string, any>;
  onAnswer: (answer: any, questionId: string) => void;
}

export const StepQuestions = ({ questions, answers, onAnswer }: StepQuestionsProps) => {
  return (
    <div className="space-y-6">
      {questions.map((question, index) => (
        <div key={question.id}>
          <div className="mb-3">
            <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
              {index + 1} of {questions.length}
            </span>
          </div>
          <QuestionCard
            question={question}
            onAnswer={(answer) => onAnswer(answer, question.id)}
            currentAnswer={answers[question.id]}
          />
        </div>
      ))}
    </div>
  );
};