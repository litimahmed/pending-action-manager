import { Separator } from "@/components/ui/separator";

interface SurveyHeaderProps {
  title: string;
  description?: string;
  logoUrl?: string;
}

export const SurveyHeader = ({ title, description, logoUrl }: SurveyHeaderProps) => {
  return (
    <header className="bg-background border-b border-border">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          {logoUrl && (
            <img 
              src={logoUrl} 
              alt="Company Logo" 
              className="h-10 w-auto"
            />
          )}
          <div className="flex-1 text-center">
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              {title}
            </h1>
          </div>
        </div>
        
        {description && (
          <div className="text-center">
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {description}
            </p>
          </div>
        )}
      </div>
    </header>
  );
};