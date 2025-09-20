import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SegmentationMatrix } from '@/components/SegmentationMatrix';
import { BeachheadRecommendation } from '@/components/BeachheadRecommendation';
import { 
  SegmentationMatrix as MatrixType, 
  RespondentProfile, 
  BeachheadAnalysis,
  MarketSegment,
  SegmentationCriteria 
} from '@/types/segmentation';
import { classifyRespondent, generateSegmentInsights } from '@/lib/segmentationMapping';
import { supabase } from '@/integrations/supabase/client';
import { Users, Target, TrendingUp, BarChart3, ArrowLeft, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

export default function Dashboard() {
  const [matrix, setMatrix] = useState<MatrixType | null>(null);
  const [respondents, setRespondents] = useState<RespondentProfile[]>([]);
  const [consumerList, setConsumerList] = useState<any[]>([]);
  const [beachheadAnalysis, setBeachheadAnalysis] = useState<BeachheadAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    
    try {
      // Load survey responses from Supabase
      const { data: responses, error: responsesError } = await supabase
        .from('survey_responses')
        .select('*')
        .order('created_at', { ascending: false });

      if (responsesError) {
        toast({
          title: "Error",
          description: "Failed to load survey data",
          variant: "destructive",
        });
        return;
      }

      // Load question answers
      const { data: answers, error: answersError } = await supabase
        .from('question_answers')
        .select('*');

      if (answersError) {
        toast({
          title: "Error", 
          description: "Failed to load answer data",
          variant: "destructive",
        });
        return;
      }

      // Group answers by response_id
      const answersGrouped = answers?.reduce((acc, answer) => {
        if (!acc[answer.response_id]) acc[answer.response_id] = {};
        acc[answer.response_id][answer.question_id] = answer.answer_value;
        return acc;
      }, {} as Record<string, Record<string, any>>) || {};

      // Convert to RespondentProfile format
      const profiles: RespondentProfile[] = responses?.map(response => {
        const responseAnswers = answersGrouped[response.id] || {};
        
        return {
          id: response.id,
          timestamp: new Date(response.timestamp),
          answers: responseAnswers,
          classifiedSegments: (response.classified_segments as any) || [],
          primarySegment: response.primary_segment as MarketSegment || 'Urban Professionals',
          confidence: response.confidence_score || 0
        };
      }) || [];

      setRespondents(profiles);
      setConsumerList(responses || []);
      generateMatrix(profiles);
      generateBeachheadAnalysis(profiles);
      
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      initializeEmptyMatrix();
    } finally {
      setLoading(false);
    }
  };

  const initializeEmptyMatrix = () => {
    const emptyMatrix: MatrixType = {
      cells: new Map(),
      totalRespondents: 0,
      lastUpdated: new Date(),
      segmentDistribution: {
        'Urban Professionals': 0,
        'Middle-Class Families': 0,
        'Elders': 0,
        'Students': 0,
        'High-Income Households': 0,
        'Rural/Peri-Urban': 0,
        'Single Parents': 0
      }
    };
    setMatrix(emptyMatrix);
  };

  const generateMatrix = (profiles: RespondentProfile[]) => {
    const segments: MarketSegment[] = [
      'Urban Professionals', 'Middle-Class Families', 'Elders', 'Students',
      'High-Income Households', 'Rural/Peri-Urban', 'Single Parents'
    ];
    
    const criteria: SegmentationCriteria[] = [
      'End User Jobs-to-be-Done', 'Pain Points', 'Competition', 'Pricing Sensitivity',
      'Frequency & AOV', 'Accessibility', 'Decision-Making Unit (DMU)', 'Complementary Assets'
    ];

    const cells = new Map();
    const segmentDistribution: Record<MarketSegment, number> = {
      'Urban Professionals': 0,
      'Middle-Class Families': 0,
      'Elders': 0,
      'Students': 0,
      'High-Income Households': 0,
      'Rural/Peri-Urban': 0,
      'Single Parents': 0
    };

    // Count primary segments
    profiles.forEach(profile => {
      segmentDistribution[profile.primarySegment]++;
    });

    // Generate matrix cells
    segments.forEach(segment => {
      criteria.forEach(criteriaItem => {
        const segmentProfiles = profiles.filter(p => p.primarySegment === segment);
        const insights = generateSegmentInsights(segment, segmentProfiles);
        
        cells.set(`${segment}-${criteriaItem}`, {
          segment,
          criteria: criteriaItem,
          respondentCount: segmentProfiles.length,
          insights,
          keyPatterns: generateKeyPatterns(segment, criteriaItem, segmentProfiles),
          averageValues: calculateAverageValues(segmentProfiles)
        });
      });
    });

    const newMatrix: MatrixType = {
      cells,
      totalRespondents: profiles.length,
      lastUpdated: new Date(),
      segmentDistribution
    };

    setMatrix(newMatrix);
  };

  const generateKeyPatterns = (segment: MarketSegment, criteria: SegmentationCriteria, profiles: RespondentProfile[]): string[] => {
    if (profiles.length === 0) return [];
    
    // Generate patterns based on criteria type
    const patterns: string[] = [];
    
    switch (criteria) {
      case 'Pain Points':
        // Analyze pain point responses
        const painPoints = profiles.map(p => p.answers['3.1']).filter(Boolean);
        if (painPoints.length > 0) {
          patterns.push(`${painPoints.length} detailed pain point responses`);
        }
        break;
        
      case 'Pricing Sensitivity':
        // Analyze pricing responses
        const deliveryFees = profiles.map(p => p.answers['5.1']).filter(Boolean);
        const lowFeeCount = deliveryFees.filter(fee => fee.includes('150')).length;
        if (lowFeeCount > 0) {
          patterns.push(`${((lowFeeCount / deliveryFees.length) * 100).toFixed(0)}% prefer low delivery fees`);
        }
        break;
        
      case 'Frequency & AOV':
        // Analyze frequency and spending
        const frequency = profiles.map(p => p.answers['6.1']).filter(Boolean);
        const spending = profiles.map(p => p.answers['6.2']).filter(Boolean);
        if (frequency.length > 0) {
          patterns.push(`Shopping frequency patterns: ${frequency.length} responses`);
        }
        break;
        
      default:
        patterns.push(`${profiles.length} respondents in this segment`);
    }
    
    return patterns;
  };

  const calculateAverageValues = (profiles: RespondentProfile[]): Record<string, number> => {
    if (profiles.length === 0) return {};
    
    return {
      confidence: profiles.reduce((sum, p) => sum + p.confidence, 0) / profiles.length,
      responseCount: profiles.length
    };
  };

  const generateBeachheadAnalysis = (profiles: RespondentProfile[]) => {
    if (profiles.length === 0) return;

    // Calculate scores for each segment
    const segmentScores: Record<MarketSegment, number> = {
      'Urban Professionals': 0,
      'Middle-Class Families': 0,
      'Elders': 0,
      'Students': 0,
      'High-Income Households': 0,
      'Rural/Peri-Urban': 0,
      'Single Parents': 0
    };

    // Score based on multiple factors
    Object.keys(segmentScores).forEach(segment => {
      const segmentProfiles = profiles.filter(p => p.primarySegment === segment as MarketSegment);
      const marketSize = segmentProfiles.length;
      
      // Pain point intensity (more pain = higher score)
      const painPointIntensity = calculatePainPointIntensity(segmentProfiles);
      
      // Pricing sensitivity (moderate sensitivity is good)
      const pricingSensitivity = calculatePricingSensitivity(segmentProfiles);
      
      // Accessibility score
      const accessibilityScore = calculateAccessibilityScore(segmentProfiles);
      
      // Calculate composite score
      segmentScores[segment as MarketSegment] = 
        (marketSize * 0.3) + 
        (painPointIntensity * 0.3) + 
        (pricingSensitivity * 0.2) + 
        (accessibilityScore * 0.2);
    });

    // Find recommended segment
    const recommendedSegment = Object.entries(segmentScores).reduce((a, b) => 
      segmentScores[a[0] as MarketSegment] > segmentScores[b[0] as MarketSegment] ? a : b
    )[0] as MarketSegment;

    const analysis: BeachheadAnalysis = {
      recommendedSegment,
      score: segmentScores[recommendedSegment],
      reasoning: generateRecommendationReasoning(recommendedSegment, profiles),
      marketSize: profiles.filter(p => p.primarySegment === recommendedSegment).length,
      painPointIntensity: calculatePainPointIntensity(profiles.filter(p => p.primarySegment === recommendedSegment)),
      pricingSensitivity: calculatePricingSensitivity(profiles.filter(p => p.primarySegment === recommendedSegment)),
      accessibilityScore: calculateAccessibilityScore(profiles.filter(p => p.primarySegment === recommendedSegment)),
      competitionLevel: 0.5 // Placeholder
    };

    setBeachheadAnalysis(analysis);
  };

  const calculatePainPointIntensity = (profiles: RespondentProfile[]): number => {
    if (profiles.length === 0) return 0;
    
    const frustrationLevels = profiles.map(p => p.answers['3.3']).filter(Boolean);
    const highFrustration = frustrationLevels.filter(level => 
      level.includes('very frustrating') || level.includes('somewhat bothersome')
    ).length;
    
    return frustrationLevels.length > 0 ? (highFrustration / frustrationLevels.length) : 0;
  };

  const calculatePricingSensitivity = (profiles: RespondentProfile[]): number => {
    if (profiles.length === 0) return 0;
    
    const deliveryFees = profiles.map(p => p.answers['5.1']).filter(Boolean);
    const moderateFees = deliveryFees.filter(fee => 
      fee.includes('150-250') || fee.includes('250-400')
    ).length;
    
    return deliveryFees.length > 0 ? (moderateFees / deliveryFees.length) : 0;
  };

  const calculateAccessibilityScore = (profiles: RespondentProfile[]): number => {
    if (profiles.length === 0) return 0;
    
    const accessAnswers = profiles.map(p => p.answers['9.2']).filter(Boolean);
    const easyAccess = accessAnswers.filter(access => 
      access.includes('Very easy') || access.includes('Generally accessible')
    ).length;
    
    return accessAnswers.length > 0 ? (easyAccess / accessAnswers.length) : 0;
  };

  const generateRecommendationReasoning = (segment: MarketSegment, profiles: RespondentProfile[]): string[] => {
    const segmentProfiles = profiles.filter(p => p.primarySegment === segment);
    const reasoning: string[] = [];
    
    reasoning.push(`Market size: ${segmentProfiles.length} respondents (${((segmentProfiles.length / profiles.length) * 100).toFixed(1)}%)`);
    
    const painIntensity = calculatePainPointIntensity(segmentProfiles);
    reasoning.push(`Pain point intensity: ${(painIntensity * 100).toFixed(0)}% express frustration with current shopping`);
    
    const pricing = calculatePricingSensitivity(segmentProfiles);
    reasoning.push(`Pricing alignment: ${(pricing * 100).toFixed(0)}% accept moderate delivery fees`);
    
    return reasoning;
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Loading dashboard data...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Survey
          </Link>
          <h1 className="text-3xl font-bold">Market Research Dashboard</h1>
          <p className="text-muted-foreground">
            Analyze market segments and identify your beachhead opportunity
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Respondents</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{respondents.length}</div>
            <p className="text-xs text-muted-foreground">Survey responses collected</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Segments</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {matrix ? Object.values(matrix.segmentDistribution).filter(count => count > 0).length : 0}
            </div>
            <p className="text-xs text-muted-foreground">Segments with respondents</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Beachhead Segment</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {beachheadAnalysis?.recommendedSegment || 'Not enough data'}
            </div>
            <p className="text-xs text-muted-foreground">Recommended target</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confidence Score</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {beachheadAnalysis ? `${(beachheadAnalysis.score * 20).toFixed(0)}%` : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">Recommendation confidence</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="matrix" className="space-y-6">
        <TabsList>
          <TabsTrigger value="matrix">Segmentation Matrix</TabsTrigger>
          <TabsTrigger value="consumers">Consumer List</TabsTrigger>
          <TabsTrigger value="beachhead">Beachhead Analysis</TabsTrigger>
          <TabsTrigger value="insights">Segment Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="matrix">
          {matrix && <SegmentationMatrix matrix={matrix} />}
        </TabsContent>

        <TabsContent value="consumers">
          <Card>
            <CardHeader>
              <CardTitle>Consumer Inquiries</CardTitle>
              <p className="text-sm text-muted-foreground">
                View individual consumer survey responses and classifications
              </p>
            </CardHeader>
            <CardContent>
              {consumerList.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Consumer ID</TableHead>
                      <TableHead>Completion</TableHead>
                      <TableHead>Market Segment</TableHead>
                      <TableHead>Confidence</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {consumerList.map((consumer) => (
                      <TableRow key={consumer.id}>
                        <TableCell className="font-medium">
                          {consumer.consumer_id}
                        </TableCell>
                        <TableCell>
                          <Badge variant={consumer.is_completed ? "default" : "secondary"}>
                            {consumer.is_completed ? "Completed" : "In Progress"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {consumer.primary_segment ? (
                            <Badge variant="outline">{consumer.primary_segment}</Badge>
                          ) : (
                            <span className="text-muted-foreground">Not classified</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {consumer.confidence_score ? 
                            `${(consumer.confidence_score * 100).toFixed(1)}%` : 
                            'N/A'
                          }
                        </TableCell>
                        <TableCell>
                          {new Date(consumer.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Link to={`/consumer/${consumer.consumer_id.replace('Consumer #', '')}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-1" />
                              View Details
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No consumer inquiries yet.</p>
                  <Link to="/">
                    <Button className="mt-4">Start First Survey</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="beachhead">
          {beachheadAnalysis && <BeachheadRecommendation analysis={beachheadAnalysis} />}
        </TabsContent>

        <TabsContent value="insights">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {matrix && Object.entries(matrix.segmentDistribution).map(([segment, count]) => {
              if (count === 0) return null;
              
              const segmentProfiles = respondents.filter(r => r.primarySegment === segment as MarketSegment);
              const insights = generateSegmentInsights(segment as MarketSegment, segmentProfiles);
              
              return (
                <Card key={segment}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {segment}
                      <Badge variant="secondary">{count} respondents</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {insights.length > 0 ? (
                        <ul className="space-y-2">
                          {insights.map((insight, index) => (
                            <li key={index} className="text-sm flex items-start gap-2">
                              <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                              {insight}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Not enough data for detailed insights yet.
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}