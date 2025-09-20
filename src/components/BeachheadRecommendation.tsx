import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BeachheadAnalysis } from '@/types/segmentation';
import { Target, TrendingUp, DollarSign, MapPin, Zap, Users } from 'lucide-react';

interface BeachheadRecommendationProps {
  analysis: BeachheadAnalysis;
}

export const BeachheadRecommendation = ({ analysis }: BeachheadRecommendationProps) => {
  return (
    <div className="space-y-6">
      {/* Main Recommendation */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Target className="w-6 h-6 text-primary" />
            Recommended Beachhead Market
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-2xl font-bold text-primary mb-2">
                {analysis.recommendedSegment}
              </h3>
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="default" className="bg-primary">
                  Confidence Score: {(analysis.score * 20).toFixed(0)}%
                </Badge>
                <Badge variant="secondary">
                  Market Size: {analysis.marketSize} respondents
                </Badge>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Why this segment?</h4>
              <ul className="space-y-2">
                {analysis.reasoning.map((reason, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Market Size</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analysis.marketSize}</div>
            <Progress value={(analysis.marketSize / 20) * 100} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Respondents in this segment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pain Intensity</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(analysis.painPointIntensity * 100).toFixed(0)}%
            </div>
            <Progress value={analysis.painPointIntensity * 100} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Experience shopping frustration
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Price Alignment</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(analysis.pricingSensitivity * 100).toFixed(0)}%
            </div>
            <Progress value={analysis.pricingSensitivity * 100} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Accept moderate pricing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accessibility</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(analysis.accessibilityScore * 100).toFixed(0)}%
            </div>
            <Progress value={analysis.accessibilityScore * 100} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Easy delivery access
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Strategic Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Strategic Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Go-to-Market Strategy</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Focus your initial launch on the <strong>{analysis.recommendedSegment}</strong> segment with these key considerations:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h5 className="font-medium text-sm">Product Focus</h5>
                  <ul className="text-sm space-y-1">
                    <li>• Optimize for their specific shopping patterns</li>
                    <li>• Address their key pain points first</li>
                    <li>• Price according to their sensitivity level</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h5 className="font-medium text-sm">Marketing Approach</h5>
                  <ul className="text-sm space-y-1">
                    <li>• Target through their preferred channels</li>
                    <li>• Emphasize value propositions that matter to them</li>
                    <li>• Build trust through their trusted sources</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Success Metrics to Track</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Badge variant="outline" className="justify-center py-2">
                  Customer Acquisition Rate
                </Badge>
                <Badge variant="outline" className="justify-center py-2">
                  Average Order Value
                </Badge>
                <Badge variant="outline" className="justify-center py-2">
                  Customer Satisfaction
                </Badge>
              </div>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2">Next Steps</h4>
              <ol className="text-sm space-y-1 list-decimal list-inside">
                <li>Validate this recommendation with additional {analysis.recommendedSegment} respondents</li>
                <li>Develop a minimum viable product (MVP) tailored to their needs</li>
                <li>Create targeted marketing messages and channels</li>
                <li>Plan a pilot launch with this segment</li>
                <li>Collect feedback and iterate before expanding to other segments</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};