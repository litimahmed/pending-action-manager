import { MarketSegment, SegmentClassification, RespondentProfile, SegmentationCriteria } from '@/types/segmentation';

// Mapping rules for classifying respondents into market segments
const segmentationRules = {
  'Urban Professionals': {
    ageRange: ['25–40', '40–60'],
    workStatus: ['Working full-time', 'Working part-time'],
    transport: ['By car', 'Taxi/ride-sharing'],
    pricePreference: ['Mix of price and quality', 'Premium/high-quality products'],
    timeSpent: ['1-2 hours - somewhat bothersome', '2+ hours - very frustrating'],
    spendingRange: ['5,000-8,000 DZD', '8,000-15,000 DZD', 'Over 15,000 DZD'],
    weight: 1.0
  },
  'Middle-Class Families': {
    household: ['Small family (3-4 people)', 'Large family (5+ people)'],
    children: ['Yes, young children (under 12)', 'Yes, teenagers (12-18)', 'Yes, adult children living at home'],
    workStatus: ['Working full-time', 'Working part-time', 'Managing household/homemaker'],
    pricePreference: ['Mix of price and quality', 'Usually cheapest options'],
    shoppingFreq: ['3-4 times', '5-8 times'],
    spendingRange: ['2,000-5,000 DZD', '5,000-8,000 DZD'],
    weight: 1.0
  },
  'Elders': {
    ageRange: ['Above 60'],
    workStatus: ['Retired', 'Managing household/homemaker'],
    transport: ['Walking', 'By bus/public transport'],
    challenges: ['Carrying heavy bags', 'Transport to/from store'],
    timeSpent: ['1-2 hours - somewhat bothersome', '2+ hours - very frustrating'],
    trustSource: ['Family members', 'Neighbors'],
    weight: 1.2
  },
  'Students': {
    ageRange: ['Under 25'],
    workStatus: ['Student'],
    household: ['Live alone (1 person)', 'With roommates'],
    pricePreference: ['Usually cheapest options'],
    spendingRange: ['Under 2,000 DZD', '2,000-5,000 DZD'],
    transport: ['Walking', 'By bus/public transport'],
    weight: 1.1
  },
  'High-Income Households': {
    pricePreference: ['Premium/high-quality products'],
    spendingRange: ['8,000-15,000 DZD', 'Over 15,000 DZD'],
    transport: ['By car', 'Taxi/ride-sharing'],
    deliveryFee: ['400+ DZD is fine', 'Would depend on service quality'],
    coldChain: ['Yes, cold chain very important'],
    weight: 0.9
  },
  'Rural/Peri-Urban': {
    transport: ['By bus/public transport', 'Walking', 'Bicycle/motorcycle'],
    access: ['Some parking challenges', 'Difficult access', 'Very difficult access'],
    internet: ['Internet sometimes unreliable', 'Would need call/SMS backup', 'Prefer phone orders anyway'],
    shoppingFreq: ['1-2 times', '3-4 times'],
    basketSize: ['Always big baskets', 'Usually big baskets'],
    weight: 1.0
  },
  'Single Parents': {
    household: ['Small family (3-4 people)', 'Large family (5+ people)'],
    children: ['Yes, young children (under 12)', 'Yes, teenagers (12-18)'],
    workStatus: ['Working full-time', 'Working part-time', 'Managing household/homemaker'],
    challenges: ['Carrying heavy bags', 'Transport to/from store', 'Crowded stores'],
    timeSpent: ['1-2 hours - somewhat bothersome', '2+ hours - very frustrating'],
    decisionMaker: ['I would decide myself'],
    weight: 1.1
  }
};

export function classifyRespondent(answers: Record<string, any>): SegmentClassification[] {
  const classifications: SegmentClassification[] = [];

  for (const [segment, rules] of Object.entries(segmentationRules)) {
    let score = 0;
    let maxScore = 0;
    const matchedFactors: string[] = [];

    // Check each rule category
    for (const [ruleType, acceptedValues] of Object.entries(rules)) {
      if (ruleType === 'weight') continue;
      
      maxScore += 1;
      
      // Find corresponding answer key
      const answerKey = getAnswerKeyForRule(ruleType);
      if (!answerKey || !answers[answerKey]) continue;

      const userAnswer = answers[answerKey];
      
      // Check if user's answer matches any accepted value
      if (Array.isArray(acceptedValues)) {
        if (Array.isArray(userAnswer)) {
          // Multiple choice question
          const hasMatch = userAnswer.some(answer => acceptedValues.includes(answer));
          if (hasMatch) {
            score += 1;
            matchedFactors.push(`${ruleType}: ${userAnswer.join(', ')}`);
          }
        } else {
          // Single choice question
          if (acceptedValues.includes(userAnswer)) {
            score += 1;
            matchedFactors.push(`${ruleType}: ${userAnswer}`);
          }
        }
      }
    }

    const probability = maxScore > 0 ? (score / maxScore) * (rules.weight || 1.0) : 0;
    
    if (probability > 0.1) { // Only include segments with >10% match
      classifications.push({
        segment: segment as MarketSegment,
        probability,
        reasonFactors: matchedFactors
      });
    }
  }

  return classifications.sort((a, b) => b.probability - a.probability);
}

function getAnswerKeyForRule(ruleType: string): string | null {
  const ruleMapping: Record<string, string> = {
    'ageRange': '1.2',
    'household': '1.3',
    'workStatus': '1.4',
    'transport': '1.5',
    'pricePreference': '1.6',
    'children': '1.7',
    'shoppingFreq': '6.1',
    'spendingRange': '6.2',
    'basketSize': '6.3',
    'challenges': '3.4',
    'timeSpent': '3.3',
    'deliveryFee': '5.1',
    'trustSource': '10.1',
    'access': '9.2',
    'internet': '9.4',
    'coldChain': '9.3',
    'decisionMaker': '8.1'
  };
  
  return ruleMapping[ruleType] || null;
}

export function generateSegmentInsights(segment: MarketSegment, respondents: RespondentProfile[]): string[] {
  const segmentRespondents = respondents.filter(r => r.primarySegment === segment);
  if (segmentRespondents.length === 0) return [];

  const insights: string[] = [];
  
  // Analyze common patterns
  const commonAnswers = analyzeCommonAnswers(segmentRespondents);
  insights.push(...commonAnswers);
  
  // Analyze pain points
  const painPoints = analyzePainPoints(segmentRespondents);
  insights.push(...painPoints);
  
  // Analyze pricing sensitivity
  const pricingInsights = analyzePricing(segmentRespondents);
  insights.push(...pricingInsights);

  return insights;
}

function analyzeCommonAnswers(respondents: RespondentProfile[]): string[] {
  const insights: string[] = [];
  
  // Group by common answers
  const answerFrequency: Record<string, Record<string, number>> = {};
  
  respondents.forEach(respondent => {
    Object.entries(respondent.answers).forEach(([questionId, answer]) => {
      if (!answerFrequency[questionId]) answerFrequency[questionId] = {};
      
      const answerStr = Array.isArray(answer) ? answer.join(', ') : answer;
      answerFrequency[questionId][answerStr] = (answerFrequency[questionId][answerStr] || 0) + 1;
    });
  });

  // Find dominant patterns (>60% of respondents)
  Object.entries(answerFrequency).forEach(([questionId, answers]) => {
    const totalRespondents = respondents.length;
    Object.entries(answers).forEach(([answer, count]) => {
      const percentage = (count / totalRespondents) * 100;
      if (percentage >= 60) {
        insights.push(`${percentage.toFixed(0)}% prefer: ${answer}`);
      }
    });
  });

  return insights;
}

function analyzePainPoints(respondents: RespondentProfile[]): string[] {
  const painPoints: string[] = [];
  
  // Analyze text responses for common pain points
  const painPointTexts = respondents
    .map(r => r.answers['3.1'])
    .filter(Boolean);
    
  if (painPointTexts.length > 0) {
    // Simple keyword analysis
    const keywords = ['time', 'transport', 'heavy', 'queue', 'parking', 'crowded', 'expensive'];
    keywords.forEach(keyword => {
      const mentions = painPointTexts.filter(text => 
        text.toLowerCase().includes(keyword)
      ).length;
      
      if (mentions > painPointTexts.length * 0.3) {
        painPoints.push(`Common pain point: ${keyword} (${mentions} mentions)`);
      }
    });
  }

  return painPoints;
}

function analyzePricing(respondents: RespondentProfile[]): string[] {
  const insights: string[] = [];
  
  // Analyze delivery fee tolerance
  const deliveryFees = respondents.map(r => r.answers['5.1']).filter(Boolean);
  const avgSpending = respondents.map(r => r.answers['6.2']).filter(Boolean);
  
  if (deliveryFees.length > 0) {
    const lowFeeCount = deliveryFees.filter(fee => fee.includes('150')).length;
    const percentage = (lowFeeCount / deliveryFees.length) * 100;
    
    if (percentage > 50) {
      insights.push(`Price sensitive: ${percentage.toFixed(0)}% prefer low delivery fees`);
    }
  }

  return insights;
}