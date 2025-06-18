
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Brain, AlertTriangle, TrendingUp, Users, DollarSign, Clock, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ContextualInsight {
  type: 'risk' | 'priority' | 'compliance' | 'efficiency' | 'approval';
  level: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  confidence: number;
  recommendations: string[];
}

interface BusinessContext {
  department: string;
  requestType: string;
  amount?: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  complexity: number;
  riskScore: number;
  complianceFlags: string[];
  stakeholders: string[];
  historicalPattern: string;
}

interface AnalysisRequest {
  id: string;
  content: string;
  timestamp: Date;
  context?: BusinessContext;
  insights: ContextualInsight[];
  status: 'analyzing' | 'completed' | 'error';
}

export const ContextualAnalyzer = () => {
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisRequest[]>([]);
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisRequest | null>(null);

  const analyzeContext = async (text: string): Promise<BusinessContext> => {
    // Simulate AI analysis of business context
    const lowerText = text.toLowerCase();
    
    // Detect department
    let department = 'General';
    if (lowerText.includes('marketing') || lowerText.includes('campaign')) department = 'Marketing';
    else if (lowerText.includes('finance') || lowerText.includes('accounting')) department = 'Finance';
    else if (lowerText.includes('hr') || lowerText.includes('human resources')) department = 'HR';
    else if (lowerText.includes('it') || lowerText.includes('technology')) department = 'IT';

    // Detect request type
    let requestType = 'General Request';
    if (lowerText.includes('expense') || lowerText.includes('cost')) requestType = 'Expense Request';
    else if (lowerText.includes('approval') || lowerText.includes('approve')) requestType = 'Approval Request';
    else if (lowerText.includes('purchase') || lowerText.includes('buy')) requestType = 'Purchase Request';
    else if (lowerText.includes('contract') || lowerText.includes('agreement')) requestType = 'Contract Request';

    // Extract amount
    const amountMatch = text.match(/\$?([\d,]+(?:\.\d{2})?)/);
    const amount = amountMatch ? parseFloat(amountMatch[1].replace(',', '')) : undefined;

    // Determine urgency
    let urgency: 'low' | 'medium' | 'high' | 'critical' = 'medium';
    if (lowerText.includes('urgent') || lowerText.includes('asap') || lowerText.includes('emergency')) {
      urgency = 'critical';
    } else if (lowerText.includes('priority') || lowerText.includes('important')) {
      urgency = 'high';
    } else if (lowerText.includes('whenever') || lowerText.includes('no rush')) {
      urgency = 'low';
    }

    // Calculate complexity and risk
    const complexity = Math.min(100, Math.max(20, text.length / 5 + (amount ? Math.log10(amount) * 10 : 0)));
    const riskScore = Math.min(100, (amount ? Math.log10(amount) * 15 : 30) + (urgency === 'critical' ? 30 : 0));

    // Identify compliance flags
    const complianceFlags: string[] = [];
    if (amount && amount > 5000) complianceFlags.push('High Value Transaction');
    if (lowerText.includes('vendor') || lowerText.includes('supplier')) complianceFlags.push('Third Party Risk');
    if (lowerText.includes('data') || lowerText.includes('privacy')) complianceFlags.push('Data Privacy');
    if (lowerText.includes('international') || lowerText.includes('overseas')) complianceFlags.push('International Compliance');

    // Identify stakeholders
    const stakeholders: string[] = [];
    if (lowerText.includes('manager')) stakeholders.push('Direct Manager');
    if (lowerText.includes('finance') || amount && amount > 1000) stakeholders.push('Finance Team');
    if (lowerText.includes('legal') || lowerText.includes('contract')) stakeholders.push('Legal Team');
    if (lowerText.includes('ceo') || lowerText.includes('executive')) stakeholders.push('Executive Team');

    return {
      department,
      requestType,
      amount,
      urgency,
      complexity,
      riskScore,
      complianceFlags,
      stakeholders,
      historicalPattern: 'Similar requests typically take 2-4 business days'
    };
  };

  const generateInsights = (context: BusinessContext, text: string): ContextualInsight[] => {
    const insights: ContextualInsight[] = [];

    // Risk Analysis
    if (context.riskScore > 70) {
      insights.push({
        type: 'risk',
        level: 'high',
        title: 'High Risk Transaction Detected',
        description: `Risk score: ${context.riskScore.toFixed(0)}%. This request requires additional scrutiny due to ${context.amount ? 'high monetary value' : 'complexity factors'}.`,
        confidence: 85,
        recommendations: [
          'Require additional approval layer',
          'Conduct enhanced due diligence',
          'Document risk mitigation steps'
        ]
      });
    }

    // Priority Assessment
    if (context.urgency === 'critical') {
      insights.push({
        type: 'priority',
        level: 'critical',
        title: 'Critical Urgency Detected',
        description: 'This request has been flagged as urgent and may require expedited processing.',
        confidence: 90,
        recommendations: [
          'Fast-track through approval chain',
          'Notify all stakeholders immediately',
          'Set up monitoring for completion'
        ]
      });
    }

    // Compliance Check
    if (context.complianceFlags.length > 0) {
      insights.push({
        type: 'compliance',
        level: context.complianceFlags.length > 2 ? 'high' : 'medium',
        title: 'Compliance Requirements Identified',
        description: `${context.complianceFlags.length} compliance flag(s) detected: ${context.complianceFlags.join(', ')}`,
        confidence: 95,
        recommendations: [
          'Review applicable policies',
          'Ensure proper documentation',
          'Involve compliance team if needed'
        ]
      });
    }

    // Efficiency Optimization
    if (context.stakeholders.length > 2) {
      insights.push({
        type: 'efficiency',
        level: 'medium',
        title: 'Multi-Stakeholder Coordination Required',
        description: `${context.stakeholders.length} stakeholder groups identified. Consider parallel processing to reduce cycle time.`,
        confidence: 80,
        recommendations: [
          'Set up parallel approval workflows',
          'Create stakeholder notification groups',
          'Establish clear deadlines for each party'
        ]
      });
    }

    // Approval Pathway
    insights.push({
      type: 'approval',
      level: context.amount && context.amount > 5000 ? 'high' : 'medium',
      title: 'Recommended Approval Path',
      description: `Based on context analysis, this request should follow the ${context.department} department's ${context.amount && context.amount > 5000 ? 'executive' : 'standard'} approval process.`,
      confidence: 88,
      recommendations: [
        `Route to ${context.stakeholders.join(' → ')}`,
        'Set appropriate SLA expectations',
        'Enable auto-escalation if delayed'
      ]
    });

    return insights;
  };

  const performAnalysis = async () => {
    if (!inputText.trim()) {
      toast.error('Please enter some text to analyze');
      return;
    }

    setIsAnalyzing(true);
    
    const newAnalysis: AnalysisRequest = {
      id: `analysis-${Date.now()}`,
      content: inputText,
      timestamp: new Date(),
      insights: [],
      status: 'analyzing'
    };

    setCurrentAnalysis(newAnalysis);
    setAnalysisHistory(prev => [newAnalysis, ...prev.slice(0, 4)]);

    try {
      // Simulate analysis time
      await new Promise(resolve => setTimeout(resolve, 2000));

      const context = await analyzeContext(inputText);
      const insights = generateInsights(context, inputText);

      const completedAnalysis = {
        ...newAnalysis,
        context,
        insights,
        status: 'completed' as const
      };

      setCurrentAnalysis(completedAnalysis);
      setAnalysisHistory(prev => [completedAnalysis, ...prev.slice(1)]);
      
      toast.success('Contextual analysis completed!');
    } catch (error) {
      const errorAnalysis = { ...newAnalysis, status: 'error' as const };
      setCurrentAnalysis(errorAnalysis);
      setAnalysisHistory(prev => [errorAnalysis, ...prev.slice(1)]);
      toast.error('Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'risk': return AlertTriangle;
      case 'priority': return TrendingUp;
      case 'compliance': return CheckCircle;
      case 'efficiency': return Clock;
      case 'approval': return Users;
      default: return Brain;
    }
  };

  const getInsightColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <Brain className="h-6 w-6 text-purple-600" />
            <span>Contextual Understanding Engine</span>
          </h2>
          <p className="text-gray-600">AI-powered analysis of business context and intelligent insights</p>
        </div>
      </div>

      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle>Request Analysis</CardTitle>
          <CardDescription>
            Enter any business request, document, or process description for contextual analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Example: I need approval for a $15,000 marketing campaign for our Q4 product launch. This is urgent as we need to start by next week to meet our holiday sales targets..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={4}
            className="resize-none"
          />
          
          <Button 
            onClick={performAnalysis}
            disabled={isAnalyzing || !inputText.trim()}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isAnalyzing ? (
              <>
                <Brain className="h-4 w-4 mr-2 animate-pulse" />
                Analyzing Context...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                Analyze Context
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Current Analysis Results */}
      {currentAnalysis && currentAnalysis.status === 'completed' && currentAnalysis.context && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Business Context */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Business Context</CardTitle>
              <CardDescription>Extracted contextual information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Department</p>
                  <Badge variant="outline">{currentAnalysis.context.department}</Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Request Type</p>
                  <Badge variant="outline">{currentAnalysis.context.requestType}</Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Urgency</p>
                  <Badge className={getInsightColor(currentAnalysis.context.urgency)}>
                    {currentAnalysis.context.urgency}
                  </Badge>
                </div>
                {currentAnalysis.context.amount && (
                  <div>
                    <p className="text-sm text-gray-500">Amount</p>
                    <Badge variant="outline">
                      <DollarSign className="h-3 w-3 mr-1" />
                      {currentAnalysis.context.amount.toLocaleString()}
                    </Badge>
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-2">Complexity Score</p>
                <Progress value={currentAnalysis.context.complexity} className="mb-1" />
                <p className="text-xs text-gray-600">{currentAnalysis.context.complexity.toFixed(0)}% complexity</p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-2">Risk Score</p>
                <Progress value={currentAnalysis.context.riskScore} className="mb-1" />
                <p className="text-xs text-gray-600">{currentAnalysis.context.riskScore.toFixed(0)}% risk level</p>
              </div>

              {currentAnalysis.context.stakeholders.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Stakeholders</p>
                  <div className="flex flex-wrap gap-1">
                    {currentAnalysis.context.stakeholders.map((stakeholder, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        <Users className="h-3 w-3 mr-1" />
                        {stakeholder}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">AI Insights</CardTitle>
              <CardDescription>Contextual recommendations and analysis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 max-h-96 overflow-y-auto">
              {currentAnalysis.insights.map((insight, index) => {
                const IconComponent = getInsightIcon(insight.type);
                return (
                  <div key={index} className={`border rounded-lg p-3 ${getInsightColor(insight.level)}`}>
                    <div className="flex items-start space-x-3">
                      <IconComponent className="h-5 w-5 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm">{insight.title}</h4>
                          <Badge variant="outline" className="text-xs">
                            {insight.confidence}% confidence
                          </Badge>
                        </div>
                        <p className="text-sm opacity-90">{insight.description}</p>
                        {insight.recommendations.length > 0 && (
                          <div>
                            <p className="text-xs font-medium mb-1">Recommendations:</p>
                            <ul className="text-xs space-y-1">
                              {insight.recommendations.map((rec, recIndex) => (
                                <li key={recIndex} className="flex items-center space-x-1">
                                  <span className="w-1 h-1 bg-current rounded-full flex-shrink-0"></span>
                                  <span>{rec}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Analysis History */}
      {analysisHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Analysis History</CardTitle>
            <CardDescription>Previous contextual analyses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analysisHistory.slice(0, 3).map((analysis) => (
                <div key={analysis.id} className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">
                      {analysis.context?.requestType || 'Analysis'}
                    </span>
                    <div className="flex items-center space-x-2">
                      <Badge variant={analysis.status === 'completed' ? 'default' : 'secondary'}>
                        {analysis.status}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {analysis.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 truncate">
                    {analysis.content.substring(0, 100)}...
                  </p>
                  {analysis.insights.length > 0 && (
                    <div className="flex items-center space-x-1 mt-2">
                      <Brain className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        {analysis.insights.length} insights generated
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
