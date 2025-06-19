import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Gem, TrendingUp, Calendar, Target, AlertCircle, Clock, Users } from 'lucide-react';

interface Prediction {
  id: string;
  type: 'workflow_demand' | 'resource_need' | 'bottleneck' | 'completion_time';
  title: string;
  description: string;
  probability: number;
  timeframe: string;
  impact: 'low' | 'medium' | 'high';
  recommendedAction: string;
  basedOn: string[];
}

interface WorkflowPattern {
  id: string;
  name: string;
  frequency: string;
  nextPredicted: Date;
  confidence: number;
  triggers: string[];
  suggestedPreparation: string;
}

export const PredictiveWorkflowEngine = () => {
  const [predictions] = useState<Prediction[]>([
    {
      id: '1',
      type: 'workflow_demand',
      title: 'Expense Approval Surge Expected',
      description: 'High volume of expense approvals predicted for next week due to quarter-end',
      probability: 0.89,
      timeframe: 'Next 5-7 days',
      impact: 'high',
      recommendedAction: 'Pre-allocate additional approval agents and setup auto-approval rules',
      basedOn: ['Historical Q-end patterns', 'Current expense trends', 'Calendar events']
    },
    {
      id: '2',
      type: 'bottleneck',
      title: 'Marketing Approval Bottleneck',
      description: 'Marketing director likely to become workflow bottleneck with 5 campaigns pending',
      probability: 0.76,
      timeframe: 'Next 2-3 days',
      impact: 'medium',
      recommendedAction: 'Delegate approval authority or batch similar requests',
      basedOn: ['Current workload', 'Approval velocity', 'Pending requests']
    },
    {
      id: '3',
      type: 'resource_need',
      title: 'Additional Processing Power Required',
      description: 'AI analysis workload expected to increase by 40% due to holiday campaigns',
      probability: 0.82,
      timeframe: 'Next 10 days',
      impact: 'medium',
      recommendedAction: 'Scale up processing resources and optimize AI agent allocation',
      basedOn: ['Seasonal patterns', 'Campaign schedules', 'Resource utilization']
    }
  ]);

  const [patterns] = useState<WorkflowPattern[]>([
    {
      id: '1',
      name: 'Monthly Budget Review',
      frequency: 'Every 1st Monday',
      nextPredicted: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      confidence: 0.95,
      triggers: ['Calendar event', 'Finance department activity'],
      suggestedPreparation: 'Prepare budget reports and schedule finance team availability'
    },
    {
      id: '2',
      name: 'Product Launch Workflows',
      frequency: 'Quarterly + adhoc',
      nextPredicted: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      confidence: 0.73,
      triggers: ['Product roadmap', 'Marketing calendar'],
      suggestedPreparation: 'Setup cross-team coordination workflows and approval chains'
    },
    {
      id: '3',
      name: 'Compliance Check Cycles',
      frequency: 'Every 2 weeks',
      nextPredicted: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      confidence: 0.91,
      triggers: ['Regulatory calendar', 'Audit schedules'],
      suggestedPreparation: 'Prepare compliance documentation and assign review agents'
    }
  ]);

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

  const formatTimeUntil = (date: Date) => {
    const days = Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return `${days} day${days !== 1 ? 's' : ''}`;
  };

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
                  <p className="text-sm text-yellow-700">{prediction.recommendedAction}</p>
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{prediction.timeframe}</span>
                  </div>
                  <div>Based on: {prediction.basedOn.join(', ')}</div>
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
                    <span>Next predicted: {formatTimeUntil(pattern.nextPredicted)}</span>
                    <span>{Math.round(pattern.confidence * 100)}% confidence</span>
                  </div>
                  <Progress value={pattern.confidence * 100} className="h-2" />
                </div>
                
                <div className="text-xs text-gray-600">
                  <strong>Triggers:</strong> {pattern.triggers.join(', ')}
                </div>
                
                <div className="bg-blue-50 p-2 rounded text-xs">
                  <strong>Preparation:</strong> {pattern.suggestedPreparation}
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
              <div className="text-2xl font-bold text-blue-600">12</div>
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
