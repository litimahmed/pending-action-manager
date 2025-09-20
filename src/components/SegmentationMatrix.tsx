import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SegmentationMatrix as MatrixType, MarketSegment, SegmentationCriteria } from '@/types/segmentation';
import { Eye, Download, TrendingUp } from 'lucide-react';

interface SegmentationMatrixProps {
  matrix: MatrixType;
  onCellClick?: (segment: MarketSegment, criteria: SegmentationCriteria) => void;
}

const SEGMENTS: MarketSegment[] = [
  'Urban Professionals',
  'Middle-Class Families', 
  'Elders',
  'Students',
  'High-Income Households',
  'Rural/Peri-Urban',
  'Single Parents'
];

const CRITERIA: SegmentationCriteria[] = [
  'End User Jobs-to-be-Done',
  'Pain Points',
  'Competition',
  'Pricing Sensitivity',
  'Frequency & AOV',
  'Accessibility',
  'Decision-Making Unit (DMU)',
  'Complementary Assets'
];

export const SegmentationMatrix = ({ matrix, onCellClick }: SegmentationMatrixProps) => {
  const [selectedCell, setSelectedCell] = useState<{segment: MarketSegment, criteria: SegmentationCriteria} | null>(null);

  const getCellData = (segment: MarketSegment, criteria: SegmentationCriteria) => {
    const key = `${segment}-${criteria}`;
    return matrix.cells.get(key);
  };

  const getCellColor = (respondentCount: number) => {
    if (respondentCount === 0) return 'bg-muted/20';
    if (respondentCount <= 2) return 'bg-blue-100 dark:bg-blue-900/30';
    if (respondentCount <= 5) return 'bg-blue-200 dark:bg-blue-800/50';
    if (respondentCount <= 10) return 'bg-blue-300 dark:bg-blue-700/70';
    return 'bg-blue-400 dark:bg-blue-600/90';
  };

  const handleCellClick = (segment: MarketSegment, criteria: SegmentationCriteria) => {
    setSelectedCell({ segment, criteria });
    onCellClick?.(segment, criteria);
  };

  const exportMatrix = () => {
    // Create CSV data
    const csvData = [
      ['Segment', ...CRITERIA],
      ...SEGMENTS.map(segment => [
        segment,
        ...CRITERIA.map(criteria => {
          const cellData = getCellData(segment, criteria);
          return cellData?.respondentCount || 0;
        })
      ])
    ];

    const csv = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'market-segmentation-matrix.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Market Segmentation Matrix</h2>
          <p className="text-muted-foreground">
            {matrix.totalRespondents} total respondents • Last updated: {matrix.lastUpdated.toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportMatrix} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Segment Distribution Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Segment Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Object.entries(matrix.segmentDistribution).map(([segment, count]) => (
              <Badge key={segment} variant="secondary" className="text-sm">
                {segment}: {count} ({((count / matrix.totalRespondents) * 100).toFixed(1)}%)
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Matrix Table */}
      <Card>
        <CardHeader>
          <CardTitle>Segmentation Matrix</CardTitle>
          <p className="text-sm text-muted-foreground">
            Click on cells to view detailed insights. Color intensity indicates respondent count.
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold min-w-[200px]">Criteria \ Segments</TableHead>
                  {SEGMENTS.map(segment => (
                    <TableHead key={segment} className="text-center min-w-[140px] font-semibold">
                      {segment}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {CRITERIA.map(criteria => (
                  <TableRow key={criteria}>
                    <TableCell className="font-medium bg-muted/50">
                      {criteria}
                    </TableCell>
                    {SEGMENTS.map(segment => {
                      const cellData = getCellData(segment, criteria);
                      const count = cellData?.respondentCount || 0;
                      
                      return (
                        <TableCell 
                          key={`${segment}-${criteria}`}
                          className={`text-center cursor-pointer transition-all hover:ring-2 hover:ring-primary/50 ${getCellColor(count)}`}
                          onClick={() => handleCellClick(segment, criteria)}
                        >
                          <div className="flex flex-col items-center gap-1">
                            <span className="font-semibold">{count}</span>
                            {count > 0 && (
                              <Eye className="w-3 h-3 text-muted-foreground" />
                            )}
                          </div>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Selected Cell Details */}
      {selectedCell && (
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedCell.segment} - {selectedCell.criteria}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const cellData = getCellData(selectedCell.segment, selectedCell.criteria);
              if (!cellData || cellData.respondentCount === 0) {
                return (
                  <p className="text-muted-foreground">No respondents classified in this segment-criteria combination yet.</p>
                );
              }

              return (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Respondent Count: {cellData.respondentCount}</h4>
                  </div>
                  
                  {cellData.insights.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Key Insights:</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {cellData.insights.map((insight, index) => (
                          <li key={index} className="text-sm">{insight}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {cellData.keyPatterns.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Key Patterns:</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {cellData.keyPatterns.map((pattern, index) => (
                          <li key={index} className="text-sm">{pattern}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle>Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-muted/20 rounded"></div>
              <span className="text-sm">0 respondents</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-100 dark:bg-blue-900/30 rounded"></div>
              <span className="text-sm">1-2 respondents</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-200 dark:bg-blue-800/50 rounded"></div>
              <span className="text-sm">3-5 respondents</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-300 dark:bg-blue-700/70 rounded"></div>
              <span className="text-sm">6-10 respondents</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-400 dark:bg-blue-600/90 rounded"></div>
              <span className="text-sm">10+ respondents</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};