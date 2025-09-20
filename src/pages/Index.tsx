import { useState, useCallback, useRef, useEffect } from "react";
import { ProgressIndicator } from "@/components/ProgressIndicator";
import { QuestionCard, Question } from "@/components/QuestionCard";
import { SurveyNavigation } from "@/components/SurveyNavigation";
import { StepQuestions } from "@/components/StepQuestions";
import { DashboardButton } from "@/components/DashboardButton";
import { supabase } from "@/integrations/supabase/client";
import { classifyRespondent } from "@/lib/segmentationMapping";
import { toast } from "@/hooks/use-toast";

// Survey step structure
interface SurveyStep {
  id: number;
  title: string;
  description: string;
  questions: Question[];
}

// Market research questions organized into 11 categories as per PDF structure
const marketResearchSurvey: {
  steps: SurveyStep[];
} = {
  steps: [{
    id: 1,
    title: "Demographics & Context",
    description: "Personal background and household information",
    questions: [{
      id: "1.1",
      type: "single-choice",
      title: "Are you usually the person who does the grocery shopping in your household?",
      required: true,
      options: ["Yes, I do all the grocery shopping", "Yes, I do most of it", "I share it with others", "No, someone else usually does it"]
    }, {
      id: "1.2",
      type: "single-choice",
      title: "If you don't mind, what's your age range?",
      required: true,
      options: ["Under 25", "25–40", "40–60", "Above 60"]
    }, {
      id: "1.3",
      type: "single-choice",
      title: "Do you live alone, with family, or with roommates? About how many people are in your household?",
      required: true,
      options: ["Live alone (1 person)", "With partner/spouse (2 people)", "Small family (3-4 people)", "Large family (5+ people)", "With roommates", "Other"]
    }, {
      id: "1.4",
      type: "single-choice",
      title: "Are you currently working, studying, retired, or managing the household?",
      required: true,
      options: ["Working full-time", "Working part-time", "Student", "Retired", "Managing household/homemaker", "Other"]
    }, {
      id: "1.5",
      type: "single-choice",
      title: "How do you usually get to the supermarket — by car, bus, walking?",
      required: true,
      options: ["By car", "By bus/public transport", "Walking", "Bicycle/motorcycle", "Taxi/ride-sharing"]
    }, {
      id: "1.6",
      type: "single-choice",
      title: "When you shop, do you usually go for the cheapest options, mix of price/quality, or prefer premium products?",
      required: true,
      options: ["Usually cheapest options", "Mix of price and quality", "Premium/high-quality products", "Depends on the product type"]
    }, {
      id: "1.7",
      type: "single-choice",
      title: "Do you have children you shop for regularly?",
      required: true,
      options: ["Yes, young children (under 12)", "Yes, teenagers (12-18)", "Yes, adult children living at home", "No children"]
    }]
  }, {
    id: 2,
    title: "Shopping Patterns & Needs",
    description: "Primary grocery shopping requirements and patterns",
    questions: [{
      id: "2.1",
      type: "single-choice",
      title: "When you go grocery shopping, what's the main reason — to stock up for the week, grab daily items, or handle an emergency need?",
      required: true,
      options: ["Stock up for the week", "Grab daily items", "Handle an emergency need", "Planned monthly trip", "Just when I feel like it"]
    }, {
      id: "2.2",
      type: "multiple-choice",
      title: "What kind of items do you usually buy most — fresh produce, dry goods, snacks, or household products?",
      description: "Select all that apply to your typical shopping.",
      required: true,
      options: ["Fresh produce (fruits, vegetables)", "Dry goods (rice, pasta, flour)", "Snacks and beverages", "Household products (cleaning supplies)", "Dairy and frozen items"]
    }, {
      id: "2.3",
      type: "single-choice",
      title: "What usually makes you decide it's time to shop — an empty fridge, planned weekly trip, or something missing last minute?",
      required: true,
      options: ["Empty fridge/pantry", "Planned weekly trip", "Something missing last minute", "When I see good deals", "When I have free time"]
    }, {
      id: "2.4",
      type: "single-choice",
      title: "Do you normally shop on a fixed schedule (like weekends) or only when you suddenly need something?",
      required: true,
      options: ["Fixed schedule (same days each week)", "Flexible but regular", "Only when needed urgently", "Mix of both planned and urgent"]
    }, {
      id: "2.5",
      type: "single-choice",
      title: "If you couldn't shop yourself, would you want someone else to do the full weekly basket, or just bring specific urgent items?",
      required: true,
      options: ["Full weekly basket", "Just specific urgent items", "Depends on the situation", "I prefer to always shop myself"]
    }]
  }, {
    id: 3,
    title: "Shopping Challenges",
    description: "Current frustrations and operational difficulties",
    questions: [{
      id: "3.1",
      type: "textarea",
      title: "What's the most annoying or difficult part of grocery shopping for you?",
      placeholder: "Describe your biggest frustration with grocery shopping...",
      required: true
    }, {
      id: "3.2",
      type: "textarea",
      title: "Can you tell me about the last time shopping was stressful or went badly? What happened?",
      placeholder: "Share a recent negative shopping experience...",
      required: true
    }, {
      id: "3.3",
      type: "single-choice",
      title: "How much time do you usually spend going and coming back, and does that bother you?",
      required: true,
      options: ["Under 30 minutes - no problem", "30-60 minutes - it's fine", "1-2 hours - somewhat bothersome", "2+ hours - very frustrating"]
    }, {
      id: "3.4",
      type: "multiple-choice",
      title: "Do you ever find carrying bags, waiting in lines, or transport to be a hassle?",
      description: "Select all that apply to your shopping experience.",
      required: true,
      options: ["Carrying heavy bags", "Waiting in long lines", "Transport to/from store", "Finding parking", "Crowded stores", "None of these bother me"]
    }, {
      id: "3.5",
      type: "single-choice",
      title: "How do you usually feel after a big shopping trip — satisfied, exhausted, frustrated?",
      required: true,
      options: ["Satisfied and accomplished", "Tired but okay", "Exhausted", "Frustrated or stressed", "Depends on the day"]
    }]
  }, {
    id: 4,
    title: "Current Solutions",
    description: "Existing alternatives and workaround strategies",
    questions: [{
      id: "4.1",
      type: "single-choice",
      title: "If you can't go to the supermarket yourself, what do you usually do?",
      required: true,
      options: ["Ask family member to go", "Send children/teenagers", "Ask neighbor or friend", "Use delivery service", "Go to nearby corner shop", "Wait until I can go myself"]
    }, {
      id: "4.2",
      type: "single-choice",
      title: "Have you ever tried a delivery service for groceries or food? How was it?",
      required: true,
      options: ["Yes, very satisfied", "Yes, it was okay", "Yes, but had problems", "Yes, but too expensive", "No, never tried", "No, don't trust it"]
    }, {
      id: "4.3",
      type: "single-choice",
      title: "When you rely on others or existing services, how well does it work for you?",
      required: true,
      options: ["Works very well", "Usually works fine", "Sometimes problematic", "Often disappointing", "Rarely works well"]
    }, {
      id: "4.4",
      type: "single-choice",
      title: "Do you feel your current way of shopping is good enough, or would you change if something better existed?",
      required: true,
      options: ["Very satisfied with current way", "Mostly satisfied", "Open to better alternatives", "Actively looking for alternatives", "Would definitely switch if possible"]
    }]
  }, {
    id: 5,
    title: "Pricing & Payment",
    description: "Budget expectations and preferred payment methods",
    questions: [{
      id: "5.1",
      type: "single-choice",
      title: "For a typical shopping trip of about 4,000 DZD, what delivery fee would feel fair — 150, 250, or 400 DZD?",
      required: true,
      options: ["150 DZD or less", "150-250 DZD", "250-400 DZD", "400+ DZD is fine", "Would depend on service quality"]
    }, {
      id: "5.2",
      type: "single-choice",
      title: "Would you prefer paying per delivery, or a monthly subscription that saves money if you order often?",
      required: true,
      options: ["Pay per delivery", "Monthly subscription", "Depends on the savings", "Not sure yet"]
    }, {
      id: "5.3",
      type: "single-choice",
      title: "Would you prefer cash on delivery, card, or mobile wallet?",
      required: true,
      options: ["Cash on delivery", "Credit/debit card", "Mobile wallet (CIB, BaridiMob)", "Bank transfer", "Flexible - any method"]
    }, {
      id: "5.4",
      type: "single-choice",
      title: "If there was a promo — like free delivery every 5th order — would that make you use the service more?",
      required: true,
      options: ["Yes, definitely", "Probably yes", "Maybe slightly", "No difference", "I prefer consistent low prices"]
    }]
  }, {
    id: 6,
    title: "Purchase Behavior",
    description: "Shopping frequency and average spending patterns",
    questions: [{
      id: "6.1",
      type: "single-choice",
      title: "How many times per month do you usually go grocery shopping?",
      required: true,
      options: ["1-2 times", "3-4 times", "5-8 times", "9-12 times", "More than 12 times"]
    }, {
      id: "6.2",
      type: "single-choice",
      title: "On average, how much do you usually spend in one trip?",
      required: true,
      options: ["Under 2,000 DZD", "2,000-5,000 DZD", "5,000-8,000 DZD", "8,000-15,000 DZD", "Over 15,000 DZD"]
    }, {
      id: "6.3",
      type: "single-choice",
      title: "Is your typical shopping trip for a big basket, or just a few small items?",
      required: true,
      options: ["Always big baskets", "Usually big baskets", "Mix of big and small", "Usually small items", "Always small items"]
    }, {
      id: "6.4",
      type: "single-choice",
      title: "Do you sometimes make a big purchase and sometimes small ones, or is it usually the same each time?",
      required: true,
      options: ["Very consistent amounts", "Somewhat consistent", "Varies quite a bit", "Completely unpredictable"]
    }]
  }, {
    id: 7,
    title: "Information Sources",
    description: "Communication channels and service discovery methods",
    questions: [{
      id: "7.1",
      type: "multiple-choice",
      title: "How do you usually hear about new services or promotions — friends, WhatsApp, Facebook, Instagram, TV, or flyers?",
      description: "Select all that apply to how you discover new services.",
      required: true,
      options: ["Friends and family", "WhatsApp", "Facebook", "Instagram", "TV/Radio", "Flyers/Leaflets", "Online ads"]
    }, {
      id: "7.2",
      type: "single-choice",
      title: "Do you spend more time on WhatsApp, Facebook, or other apps?",
      required: true,
      options: ["WhatsApp mostly", "Facebook mostly", "Instagram mostly", "TikTok mostly", "Mix of social apps", "Don't use social media much"]
    }, {
      id: "7.3",
      type: "single-choice",
      title: "Are you part of any neighborhood or school WhatsApp/Facebook groups where people share deals?",
      required: true,
      options: ["Yes, very active in such groups", "Yes, but not very active", "A few groups but rarely check", "No, not part of such groups"]
    }, {
      id: "7.4",
      type: "single-choice",
      title: "At your work/school, do people share info about services or group deals?",
      required: true,
      options: ["Yes, frequently", "Sometimes", "Rarely", "No, never", "Not applicable"]
    }, {
      id: "7.5",
      type: "single-choice",
      title: "If you liked a grocery delivery service, how likely would you be to recommend it to a friend or neighbor?",
      required: true,
      options: ["Very likely", "Somewhat likely", "Not sure", "Probably not", "Definitely not"]
    }]
  }, {
    id: 8,
    title: "Decision Making",
    description: "Household purchase decisions and approval processes",
    questions: [{
      id: "8.1",
      type: "single-choice",
      title: "If there was a grocery delivery service, who in your household would decide whether to try it?",
      required: true,
      options: ["I would decide myself", "My spouse/partner", "We would decide together", "Family head/elder", "Not sure"]
    }, {
      id: "8.2",
      type: "single-choice",
      title: "Who would actually place the order — you, your spouse, or someone else?",
      required: true,
      options: ["I would place orders", "My spouse/partner", "We would alternate", "Someone else in household", "Depends on situation"]
    }, {
      id: "8.3",
      type: "single-choice",
      title: "If you suggested using delivery, would anyone in your family oppose or encourage it?",
      required: true,
      options: ["Would encourage it", "Would be neutral", "Some might oppose", "Would likely oppose", "Not applicable"]
    }, {
      id: "8.4",
      type: "single-choice",
      title: "Would you order just for yourself, or for everyone in the household?",
      required: true,
      options: ["For the whole household", "Mainly for myself", "Mix of both", "Depends on the order", "Just for myself"]
    }, {
      id: "8.5",
      type: "single-choice",
      title: "When it comes to household spending on groceries, who manages the budget?",
      required: true,
      options: ["I manage it", "My spouse/partner", "We manage together", "Family elder", "Depends on amount"]
    }]
  }, {
    id: 9,
    title: "Delivery Requirements",
    description: "Logistical constraints and operational considerations",
    questions: [{
      id: "9.1",
      type: "single-choice",
      title: "Do you live in an apartment, house, or shared housing? If apartment: Do you have an elevator, or only stairs?",
      required: true,
      options: ["House with easy access", "Apartment with elevator", "Apartment with stairs only", "Shared housing", "Other"]
    }, {
      id: "9.2",
      type: "single-choice",
      title: "Can delivery bikes/cars easily reach your home? Or is parking/entry a problem?",
      required: true,
      options: ["Very easy access", "Generally accessible", "Some parking challenges", "Difficult access", "Very difficult access"]
    }, {
      id: "9.3",
      type: "single-choice",
      title: "Do you often buy fresh or frozen items that need refrigeration during delivery? Would it be important for you that delivery keeps food cold or frozen?",
      required: true,
      options: ["Yes, cold chain very important", "Somewhat important", "Not very important", "Don't buy much fresh/frozen", "No preference"]
    }, {
      id: "9.4",
      type: "single-choice",
      title: "Do you always have internet/WhatsApp to place an order? If internet was down, would you prefer a call/SMS option?",
      required: true,
      options: ["Always have good internet", "Usually but backup option good", "Internet sometimes unreliable", "Would need call/SMS backup", "Prefer phone orders anyway"]
    }]
  }, {
    id: 10,
    title: "Trust & Influence",
    description: "Social validation and credibility factors",
    questions: [{
      id: "10.1",
      type: "single-choice",
      title: "When you try a new service, whose opinion do you trust most — family, neighbors, friends, or online reviews?",
      required: true,
      options: ["Family members", "Close friends", "Neighbors", "Online reviews/ratings", "Community leaders", "Coworkers"]
    }, {
      id: "10.2",
      type: "single-choice",
      title: "If a respected person in your community used it, would that influence you to try?",
      required: true,
      options: ["Yes, strongly influence me", "Somewhat influence me", "Maybe slightly", "Not much influence", "No influence at all"]
    }, {
      id: "10.3",
      type: "multiple-choice",
      title: "Are you part of any groups or associations (parent groups, workplace chats, sports clubs, religious/community groups)?",
      description: "Select all that apply to your community involvement.",
      required: true,
      options: ["Parent/school groups", "Workplace groups", "Sports/hobby clubs", "Religious groups", "Neighborhood associations", "None of these"]
    }, {
      id: "10.4",
      type: "single-choice",
      title: "Would you be more willing to try if your workplace, school, or mosque recommended the service?",
      required: true,
      options: ["Yes, definitely", "Probably yes", "Maybe", "Probably not", "No, wouldn't matter"]
    }]
  }, {
    id: 11,
    title: "Trust & Safety",
    description: "Security concerns and quality assurance requirements",
    questions: [{
      id: "11.1",
      type: "single-choice",
      title: "Would you be worried about the quality of fresh products (milk, meat, vegetables) if delivered? What would reassure you — sealed packaging, temperature control, or knowing the delivery time?",
      required: true,
      options: ["Very worried - need guarantees", "Somewhat worried - want assurance", "Not very worried", "Not worried at all", "Would need to see quality first"]
    }, {
      id: "11.2",
      type: "single-choice",
      title: "If the wrong items arrived, what would you expect to happen? Would you try a new service if it promised free returns or refunds?",
      required: true,
      options: ["Expect immediate free replacement", "Expect refund or credit", "Would accept apology + discount", "Depends on the mistake", "Not sure what's fair"]
    }, {
      id: "11.3",
      type: "single-choice",
      title: "Do you feel safe paying online, or do you prefer cash on delivery? If we offered secure card/mobile payments with receipts, would that build trust?",
      required: true,
      options: ["Prefer cash on delivery always", "Mostly cash but open to cards", "Comfortable with secure online", "Prefer digital payments", "Flexible with payment methods"]
    }, {
      id: "11.4",
      type: "single-choice",
      title: "Do you worry about unknown delivery drivers coming to your home? Would you feel safer if drivers had IDs, uniforms, or ratings?",
      required: true,
      options: ["Very concerned - need ID/uniform", "Somewhat concerned", "Not very worried", "Not worried at all", "Would prefer known drivers"]
    }, {
      id: "11.5",
      type: "single-choice",
      title: "What makes you trust a new delivery service — recommendations, ratings, partnerships with big supermarkets? Would seeing a well-known supermarket's logo make you more comfortable?",
      required: true,
      options: ["Need big brand partnership", "Want user ratings/reviews", "Trust recommendations most", "Would try any if cheap", "Price matters more than trust"]
    }]
  }]
};
const Index = () => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasCompletedSurvey, setHasCompletedSurvey] = useState(false);
  const mainContentRef = useRef<HTMLElement>(null);

  // Check if any surveys exist in database
  useEffect(() => {
    checkForExistingSurveys();
  }, []);

  const checkForExistingSurveys = async () => {
    try {
      const { count } = await supabase
        .from('survey_responses')
        .select('*', { count: 'exact', head: true });
      
      setHasCompletedSurvey((count || 0) > 0);
    } catch (error) {
      console.error('Error checking surveys:', error);
    }
  };
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
      console.log('Starting survey submission...');
      console.log('Survey answers:', answers);
      
      // Generate consumer ID
      const { data: consumerIdData, error: consumerIdError } = await supabase
        .rpc('generate_consumer_id');
      
      console.log('Generated consumer ID:', consumerIdData, consumerIdError);
      
      if (consumerIdError) {
        console.error('Consumer ID generation failed:', consumerIdError);
        throw consumerIdError;
      }
      
      const consumerId = consumerIdData;
      
      // Classify market segment
      const classifications = classifyRespondent(answers);
      const primarySegment = classifications.length > 0 ? classifications[0].segment : 'Unknown';
      const confidence = classifications.length > 0 ? classifications[0].probability : 0;
      
      console.log('Market classification:', { classifications, primarySegment, confidence });
      
      // Create survey response record
      const responsePayload = {
        consumer_id: consumerId,
        is_completed: true,
        total_steps: marketResearchSurvey.steps.length,
        completed_steps: marketResearchSurvey.steps.length,
        classified_segments: JSON.parse(JSON.stringify(classifications)),
        primary_segment: primarySegment,
        confidence_score: confidence,
        completed_at: new Date().toISOString()
      };
      
      console.log('Survey response payload:', responsePayload);
      
      const { data: responseData, error: responseError } = await supabase
        .from('survey_responses')
        .insert(responsePayload)
        .select()
        .single();
      
      console.log('Survey response result:', responseData, responseError);
      
      if (responseError) {
        console.error('Survey response insertion failed:', responseError);
        throw responseError;
      }
      
      // Save individual question answers
      const questionAnswers = [];
      for (const [questionId, answer] of Object.entries(answers)) {
        const [stepIdStr] = questionId.split('.');
        const stepId = parseInt(stepIdStr);
        
        // Find question type from survey structure
        let questionType = 'single-choice';
        for (const step of marketResearchSurvey.steps) {
          const question = step.questions.find(q => q.id === questionId);
          if (question) {
            questionType = question.type;
            break;
          }
        }
        
        questionAnswers.push({
          response_id: responseData.id,
          step_id: stepId,
          question_id: questionId,
          question_type: questionType,
          answer_value: answer
        });
      }
      
      const { error: answersError } = await supabase
        .from('question_answers')
        .insert(questionAnswers);
      
      if (answersError) {
        throw answersError;
      }
      
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
  return <div className="min-h-screen bg-background">
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
          <SurveyNavigation onPrevious={handlePrevious} onNext={handleNext} onSubmit={handleSubmit} canGoPrevious={canGoPrevious} canGoNext={canGoNext} isLastQuestion={isLastStep} isSubmitting={isSubmitting} />
        </div>
      </div>

      {/* Bottom padding to account for fixed navigation */}
      <div className="h-20"></div>
    </div>;
};
export default Index;