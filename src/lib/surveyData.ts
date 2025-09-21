import { Question } from "@/components/QuestionCard";

export interface SurveyStep {
  id: number;
  title: string;
  description?: string;
  questions: Question[];
}

export interface Survey {
  id: string;
  title: string;
  description: string;
  steps: SurveyStep[];
}

export const marketResearchSurvey: Survey = {
  id: "market-research-2024",
  title: "Market Research Survey",
  description: "Understanding consumer behavior and preferences",
  steps: [
    {
      id: 1,
      title: "Personal Information",
      description: "Basic demographic information",
      questions: [
        {
          id: "1.1",
          type: "text",
          title: "What is your name?",
          required: true,
          placeholder: "Enter your full name"
        },
        {
          id: "1.2", 
          type: "single-choice",
          title: "What is your age group?",
          required: true,
          options: ["Under 25", "25–40", "40–60", "Above 60"]
        },
        {
          id: "1.3",
          type: "single-choice", 
          title: "What is your household size?",
          required: true,
          options: ["Live alone (1 person)", "With roommates", "Small family (3-4 people)", "Large family (5+ people)"]
        },
        {
          id: "1.4",
          type: "single-choice",
          title: "What is your current work status?",
          required: true,
          options: ["Working full-time", "Working part-time", "Student", "Retired", "Managing household/homemaker", "Unemployed"]
        },
        {
          id: "1.5",
          type: "single-choice",
          title: "How do you usually travel to grocery stores?",
          required: true,
          options: ["Walking", "Bicycle/motorcycle", "By car", "By bus/public transport", "Taxi/ride-sharing"]
        },
        {
          id: "1.6",
          type: "single-choice",
          title: "When shopping for groceries, what do you prioritize?",
          required: true,
          options: ["Usually cheapest options", "Mix of price and quality", "Premium/high-quality products", "Convenience over price"]
        },
        {
          id: "1.7",
          type: "single-choice",
          title: "Do you have children living at home?",
          required: true,
          options: ["No children", "Yes, young children (under 12)", "Yes, teenagers (12-18)", "Yes, adult children living at home"]
        }
      ]
    },
    {
      id: 2,
      title: "Shopping Preferences",
      description: "Understanding your shopping habits",
      questions: [
        {
          id: "2.1",
          type: "single-choice",
          title: "What time do you prefer to shop for groceries?",
          required: true,
          options: ["Early morning (6-9 AM)", "Late morning (9-12 PM)", "Afternoon (12-6 PM)", "Evening (6-9 PM)", "Late evening (after 9 PM)"]
        },
        {
          id: "2.2",
          type: "multiple-choice",
          title: "Which grocery categories do you buy most frequently?",
          required: true,
          options: ["Fresh vegetables", "Fresh fruits", "Meat & poultry", "Dairy products", "Bread & bakery", "Canned goods", "Frozen foods", "Snacks & beverages"]
        },
        {
          id: "2.3",
          type: "single-choice",
          title: "How do you usually plan your grocery shopping?",
          required: true,
          options: ["I make a detailed list", "I have a rough idea", "I decide when I get there", "I shop based on promotions"]
        }
      ]
    },
    {
      id: 3,
      title: "Current Shopping Experience",
      description: "Tell us about your current shopping experience",
      questions: [
        {
          id: "3.1",
          type: "textarea",
          title: "What are the main challenges you face when grocery shopping?",
          required: true,
          placeholder: "Describe any difficulties or frustrations you experience..."
        },
        {
          id: "3.2",
          type: "rating",
          title: "How satisfied are you with your current grocery shopping experience?",
          required: true,
          options: ["1", "2", "3", "4", "5"]
        },
        {
          id: "3.3",
          type: "single-choice",
          title: "How much time do you usually spend grocery shopping?",
          required: true,
          options: ["Less than 30 minutes - quick and easy", "30-60 minutes - manageable", "1-2 hours - somewhat bothersome", "2+ hours - very frustrating"]
        },
        {
          id: "3.4",
          type: "multiple-choice",
          title: "What are your biggest challenges with grocery shopping?",
          required: true,
          options: ["Carrying heavy bags", "Transport to/from store", "Long queues", "Crowded stores", "Limited parking", "Store hours", "Finding specific items"]
        }
      ]
    },
    {
      id: 4,
      title: "Online Shopping Attitudes",
      description: "Your thoughts on online grocery shopping",
      questions: [
        {
          id: "4.1",
          type: "single-choice",
          title: "Have you ever ordered groceries online?",
          required: true,
          options: ["Never tried it", "Tried once or twice", "Use it occasionally", "Use it regularly", "It's my primary way of shopping"]
        },
        {
          id: "4.2",
          type: "textarea",
          title: "What would encourage you to try online grocery shopping? (or use it more often)",
          required: false,
          placeholder: "Share your thoughts on what would make online grocery shopping appealing..."
        },
        {
          id: "4.3",
          type: "multiple-choice",
          title: "What concerns do you have about online grocery shopping?",
          required: false,
          options: ["Quality of fresh products", "Delivery costs", "Delivery timing", "Technology/website issues", "Payment security", "Not being able to see products", "No concerns"]
        }
      ]
    },
    {
      id: 5,
      title: "Delivery Preferences",
      description: "Understanding your delivery preferences",
      questions: [
        {
          id: "5.1",
          type: "single-choice",
          title: "What delivery fee would be acceptable for grocery delivery?",
          required: true,
          options: ["150 DZD or less", "200-300 DZD", "400+ DZD is fine", "Would depend on order size", "Would depend on service quality"]
        },
        {
          id: "5.2",
          type: "single-choice",
          title: "What delivery time would you prefer?",
          required: true,
          options: ["Same day delivery", "Next day delivery", "Within 2-3 days", "I'm flexible with timing"]
        },
        {
          id: "5.3",
          type: "multiple-choice",
          title: "What delivery options would be most convenient for you?",
          required: true,
          options: ["Home delivery", "Pickup from nearby location", "Delivery to workplace", "Scheduled delivery slots", "Express delivery option"]
        }
      ]
    },
    {
      id: 6,
      title: "Spending Patterns",
      description: "Understanding your grocery spending",
      questions: [
        {
          id: "6.1",
          type: "single-choice",
          title: "How often do you grocery shop?",
          required: true,
          options: ["Daily", "Every 2-3 days", "1-2 times", "3-4 times", "5-8 times", "Less than once per week"]
        },
        {
          id: "6.2",
          type: "single-choice",
          title: "How much do you typically spend on groceries per week?",
          required: true,
          options: ["Under 2,000 DZD", "2,000-5,000 DZD", "5,000-8,000 DZD", "8,000-15,000 DZD", "Over 15,000 DZD"]
        },
        {
          id: "6.3",
          type: "single-choice",
          title: "How would you describe your typical grocery basket size?",
          required: true,
          options: ["Small baskets - few items", "Medium baskets - moderate amount", "Usually big baskets", "Always big baskets", "Varies significantly"]
        }
      ]
    }
  ]
};