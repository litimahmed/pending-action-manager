import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Calendar, User, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface SurveyResponse {
  id: string;
  consumer_id: string;
  timestamp: string;
  completed_at: string | null;
  is_completed: boolean;
  total_steps: number;
  completed_steps: number;
  classified_segments: any;
  primary_segment: string | null;
  confidence_score: number | null;
}

interface QuestionAnswer {
  id: string;
  step_id: number;
  question_id: string;
  question_type: string;
  answer_value: any;
}

const stepTitles: Record<number, string> = {
  1: "Demographics & Context",
  2: "Shopping Patterns & Needs",
  3: "Shopping Challenges",
  4: "Current Solutions",
  5: "Pricing & Payment",
  6: "Purchase Behavior",
  7: "Information Sources",
  8: "Decision Making",
  9: "Delivery Requirements",
  10: "Trust & Influence",
  11: "Trust & Safety"
};

export default function ConsumerInquiry() {
  const { consumerId } = useParams<{ consumerId: string }>();
  const [response, setResponse] = useState<SurveyResponse | null>(null);
  const [answers, setAnswers] = useState<QuestionAnswer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConsumerData();
  }, [consumerId]);

  const fetchConsumerData = async () => {
    if (!consumerId) {
      console.log('No consumerId provided');
      return;
    }

    console.log('Raw consumerId from params:', consumerId);
    console.log('Searching for consumer_id:', `Consumer #${consumerId}`);

    try {
      // Fetch survey response
      const { data: responseData, error: responseError } = await supabase
        .from('survey_responses')
        .select('*')
        .eq('consumer_id', `Consumer #${consumerId}`)
        .single();

      console.log('Supabase response:', responseData, responseError);

      if (responseError) {
        console.error('Supabase error:', responseError);
        toast({
          title: "Error",
          description: "Failed to fetch consumer data",
          variant: "destructive",
        });
        return;
      }

      setResponse(responseData);

      // Fetch question answers
      const { data: answersData, error: answersError } = await supabase
        .from('question_answers')
        .select('*')
        .eq('response_id', responseData.id)
        .order('step_id', { ascending: true })
        .order('question_id', { ascending: true });

      if (answersError) {
        toast({
          title: "Error",
          description: "Failed to fetch answers",
          variant: "destructive",
        });
        return;
      }

      setAnswers(answersData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getAnswersByStep = (stepId: number) => {
    return answers.filter(answer => answer.step_id === stepId);
  };

  const formatAnswerValue = (value: any, type: string) => {
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    return String(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4">
        <div className="max-w-4xl mx-auto py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4">
        <div className="max-w-4xl mx-auto py-8 text-center">
          <h1 className="text-2xl font-bold text-muted-foreground">Consumer not found</h1>
          <Link to="/dashboard">
            <Button className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link to="/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">{response.consumer_id} Details</h1>
        </div>

        {/* Consumer Overview */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Consumer Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Started</p>
                  <p className="font-medium">{formatDate(response.timestamp)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={response.is_completed ? "default" : "secondary"}>
                    {response.is_completed ? "Completed" : "In Progress"}
                  </Badge>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Progress</p>
                <p className="font-medium">{response.completed_steps}/{response.total_steps} steps</p>
              </div>
            </div>

            {response.primary_segment && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-2">Market Segment Classification</p>
                <Badge variant="outline" className="text-base px-3 py-1">
                  {response.primary_segment}
                </Badge>
                {response.confidence_score && (
                  <span className="ml-2 text-sm text-muted-foreground">
                    ({(response.confidence_score * 100).toFixed(1)}% confidence)
                  </span>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Survey Answers by Step */}
        <div className="space-y-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(stepId => {
            const stepAnswers = getAnswersByStep(stepId);
            if (stepAnswers.length === 0) return null;

            return (
              <Card key={stepId}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Step {stepId}: {stepTitles[stepId]}</span>
                    <Badge variant="secondary">{stepAnswers.length} answers</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stepAnswers.map((answer, index) => (
                      <div key={answer.id}>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-muted-foreground">
                            Question {answer.question_id}
                          </p>
                          <div className="bg-muted/50 p-3 rounded-lg">
                            <p className="text-sm leading-relaxed">
                              {formatAnswerValue(answer.answer_value, answer.question_type)}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1 capitalize">
                              Type: {answer.question_type.replace('-', ' ')}
                            </p>
                          </div>
                        </div>
                        {index < stepAnswers.length - 1 && (
                          <Separator className="my-3" />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {answers.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No answers recorded yet for this consumer.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}