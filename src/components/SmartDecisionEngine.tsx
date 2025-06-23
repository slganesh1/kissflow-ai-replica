
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, Zap, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { useDecisions, useExecuteDecision } from '@/hooks/useDecisions';
import { useDecisionRules } from '@/hooks/useDecisionRules';

export const SmartDecisionEngine = () => {
  const { data: decisions = [], isLoading: decisionsLoading } = useDecisions();
  const { data: decisionRules = [], isLoading: rulesLoading } = useDecisionRules();
  const executeDecisionMutation = useExecuteDecision();

  // Debug logging
  console.log('All decisions:', decisions);
  console.log('Filtered decisions (not executed):', decisions.filter(d => d.status !== 'executed'));

  const executeDecision = (decisionId: string) => {
    console.log('Executing decision:', decisionId);
    executeDecisionMutation.mutate(decisionId);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-100';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'high': return <TrendingUp className="h-4 w-4 text-red-600" />;
      case 'medium': return <Zap className="h-4 w-4 text-yellow-600" />;
      default: return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
  };

  if (decisionsLoading || rulesLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-purple-600" />
              <span>Smart Decision Engine</span>
            </CardTitle>
            <CardDescription>
              Loading AI-powered autonomous decision making...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const pendingDecisions = decisions.filter(d => d.status !== 'executed');
  console.log('Pending decisions count:', pendingDecisions.length);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-purple-600" />
            <span>Smart Decision Engine</span>
          </CardTitle>
          <CardDescription>
            AI-powered autonomous decision making based on rules, patterns, and historical data
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Decisions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pending Decisions ({pendingDecisions.length})</CardTitle>
            <CardDescription>AI recommendations awaiting execution</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingDecisions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No pending decisions found</p>
                <p className="text-sm">All decisions have been processed</p>
              </div>
            ) : (
              pendingDecisions.map((decision) => {
                console.log('Rendering decision:', decision.id, 'Status:', decision.status);
                return (
                  <div key={decision.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium text-sm">{decision.context}</h4>
                      <div className="flex items-center space-x-2">
                        {getImpactIcon(decision.impact)}
                        <Badge className={getConfidenceColor(decision.confidence)}>
                          {Math.round(decision.confidence * 100)}% confident
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-blue-900">Recommended Action:</p>
                      <p className="text-sm text-blue-700">{decision.recommended_action}</p>
                    </div>
                    
                    <div className="text-xs text-gray-600">
                      <strong>Reasoning:</strong> {decision.reasoning}
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      <strong>Status:</strong> {decision.status} | <strong>ID:</strong> {decision.id}
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        onClick={() => executeDecision(decision.id)}
                        disabled={decision.status === 'executed' || executeDecisionMutation.isPending}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {executeDecisionMutation.isPending ? 'Executing...' : 'Execute Decision'}
                      </Button>
                      <Button size="sm" variant="outline">
                        Override
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Decision Rules */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Decision Rules</CardTitle>
            <CardDescription>Configured rules for autonomous decision making</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {decisionRules.map((rule) => (
              <div key={rule.id} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">{rule.name}</h4>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">Priority {rule.priority}</Badge>
                    <Badge className={rule.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}>
                      {rule.enabled ? 'Active' : 'Disabled'}
                    </Badge>
                  </div>
                </div>
                
                <div className="text-xs space-y-1">
                  <div><strong>Condition:</strong> <code className="bg-gray-100 px-1 rounded">{rule.condition}</code></div>
                  <div><strong>Action:</strong> <code className="bg-gray-100 px-1 rounded">{rule.action}</code></div>
                </div>
              </div>
            ))}
            
            <Button className="w-full" variant="outline">
              <Brain className="h-4 w-4 mr-2" />
              Add New Rule
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Decision Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Decision Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{decisions.length}</div>
              <div className="text-sm text-gray-600">Total Decisions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">87%</div>
              <div className="text-sm text-gray-600">Accuracy Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">3.2s</div>
              <div className="text-sm text-gray-600">Avg Decision Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">92%</div>
              <div className="text-sm text-gray-600">Automation Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
