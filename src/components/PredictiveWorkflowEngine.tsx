
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Gem, TrendingUp, Calendar, Target, AlertCircle, Clock } from 'lucide-react';
import { usePredictions } from '@/hooks/usePredictions';
import { useWorkflowPatterns } from '@/hooks/useWorkflowPatterns';

export const PredictiveWorkflowEngine = () => {
  const { data: predictions = [], isLoading: predictionsLoading } = usePredictions();
  const { data: patterns = [], isLoading: patternsLoading } = useWorkflowPatterns();

  const getProbabilityColor = (probability: number) => {
    if (probability >= 0.8) return 'text-red-600 bg-red-100';
    if (probability >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'high': return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'medium': return <TrendingUp className="h-4 w-4 text-yellow-600" />;
      default: return <Target className="h-4 w-4 text-green-600" />;
    }
  };

  const formatTimeUntil = (dateString: string) => {
    const date = new Date(dateString);
    const days = Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return `${days} day${days !== 1 ? 's' : ''}`;
  };

  if (predictionsLoading || patternsLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Gem className="h-5 w-5 text-blue-600" />
              <span>Predictive Workflow Engine</span>
            </CardTitle>
            <CardDescription>
              Loading AI-powered predictions...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Gem className="h-5 w-5 text-blue-600" />
            <span>Predictive Workflow Engine</span>
          </CardTitle>
          <CardDescription>
            AI-powered predictions for workflow demand, bottlenecks, and resource needs
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Predictions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Active Predictions</CardTitle>
            <CardDescription>AI forecasts based on patterns and trends</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {predictions.map((prediction) => (
              <div key={prediction.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    {getImpactIcon(prediction.impact)}
                    <h4 className="font-medium text-sm">{prediction.title}</h4>
                  </div>
                  <Badge className={getProbabilityColor(prediction.probability)}>
                    {Math.round(prediction.probability * 100)}% likely
                  </Badge>
                </div>
                
                <p className="text-sm text-gray-600">{prediction.description}</p>
                
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-yellow-900">Recommended Action:</p>
                  <p className="text-sm text-yellow-700">{prediction.recommended_action}</p>
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{prediction.timeframe}</span>
                  </div>
                  <div>Based on: {prediction.based_on.join(', ')}</div>
                </div>
                
                <div className="flex space-x-2">
                  <Button size="sm">Prepare Now</Button>
                  <Button size="sm" variant="outline">Schedule Prep</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Workflow Patterns */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Predicted Workflow Patterns</CardTitle>
            <CardDescription>Recurring workflows and their predicted schedules</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {patterns.map((pattern) => (
              <div key={pattern.id} className="border rounded-lg p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">{pattern.name}</h4>
                  <Badge variant="outline">{pattern.frequency}</Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span>Next predicted: {formatTimeUntil(pattern.next_predicted)}</span>
                    <span>{Math.round(pattern.confidence * 100)}% confidence</span>
                  </div>
                  <Progress value={pattern.confidence * 100} className="h-2" />
                </div>
                
                <div className="text-xs text-gray-600">
                  <strong>Triggers:</strong> {pattern.triggers.join(', ')}
                </div>
                
                <div className="bg-blue-50 p-2 rounded text-xs">
                  <strong>Preparation:</strong> {pattern.suggested_preparation}
                </div>
                
                <Button size="sm" variant="outline" className="w-full">
                  <Calendar className="h-3 w-3 mr-1" />
                  Schedule Preparation
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Prediction Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Prediction Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{predictions.length}</div>
              <div className="text-sm text-gray-600">Active Predictions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">84%</div>
              <div className="text-sm text-gray-600">Accuracy Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">3.5</div>
              <div className="text-sm text-gray-600">Days Avg Lead Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">67%</div>
              <div className="text-sm text-gray-600">Prevented Issues</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
