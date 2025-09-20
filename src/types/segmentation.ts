// Market Segmentation Types and Data Structures

export type MarketSegment = 
  | 'Urban Professionals'
  | 'Middle-Class Families'
  | 'Elders'
  | 'Students'
  | 'High-Income Households'
  | 'Rural/Peri-Urban'
  | 'Single Parents';

export type SegmentationCriteria = 
  | 'End User Jobs-to-be-Done'
  | 'Pain Points'
  | 'Competition'
  | 'Pricing Sensitivity'
  | 'Frequency & AOV'
  | 'Accessibility'
  | 'Decision-Making Unit (DMU)'
  | 'Complementary Assets';

export interface RespondentProfile {
  id: string;
  timestamp: Date;
  answers: Record<string, any>;
  classifiedSegments: SegmentClassification[];
  primarySegment: MarketSegment;
  confidence: number;
}

export interface SegmentClassification {
  segment: MarketSegment;
  probability: number;
  reasonFactors: string[];
}

export interface MatrixCell {
  segment: MarketSegment;
  criteria: SegmentationCriteria;
  respondentCount: number;
  insights: string[];
  keyPatterns: string[];
  averageValues: Record<string, number>;
}

export interface SegmentationMatrix {
  cells: Map<string, MatrixCell>;
  totalRespondents: number;
  lastUpdated: Date;
  segmentDistribution: Record<MarketSegment, number>;
}

export interface BeachheadAnalysis {
  recommendedSegment: MarketSegment;
  score: number;
  reasoning: string[];
  marketSize: number;
  painPointIntensity: number;
  pricingSensitivity: number;
  accessibilityScore: number;
  competitionLevel: number;
}