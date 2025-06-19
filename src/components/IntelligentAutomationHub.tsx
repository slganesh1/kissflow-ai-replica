
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Brain, Gem, Zap, TrendingUp, Bot, Settings } from 'lucide-react';
import { SmartDecisionEngine } from './SmartDecisionEngine';
import { PredictiveWorkflowEngine } from './PredictiveWorkflowEngine';

export const IntelligentAutomationHub = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bot className="h-6 w-6 text-blue-600" />
            <span>Intelligent Automation Hub</span>
          </CardTitle>
          <CardDescription>
            Advanced AI-powered automation with smart decision making and predictive capabilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
              <Brain className="h-8 w-8 text-purple-600" />
              <div>
                <h3 className="font-semibold text-sm">Smart Decisions</h3>
                <p className="text-xs text-gray-600">Autonomous AI decision making</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <Gem className="h-8 w-8 text-blue-600" />
              <div>
                <h3 className="font-semibold text-sm">Predictive Workflows</h3>
                <p className="text-xs text-gray-600">Anticipate workflow needs</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <Zap className="h-8 w-8 text-green-600" />
              <div>
                <h3 className="font-semibold text-sm">Auto-Optimization</h3>
                <p className="text-xs text-gray-600">Continuous improvement</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="decisions" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="decisions" className="flex items-center space-x-2">
            <Brain className="h-4 w-4" />
            <span>Smart Decisions</span>
          </TabsTrigger>
          <TabsTrigger value="predictions" className="flex items-center space-x-2">
            <Gem className="h-4 w-4" />
            <span>Predictive Engine</span>
          </TabsTrigger>
          <TabsTrigger value="optimization" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Auto-Optimization</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="decisions">
          <SmartDecisionEngine />
        </TabsContent>

        <TabsContent value="predictions">
          <PredictiveWorkflowEngine />
        </TabsContent>

        <TabsContent value="optimization">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span>Auto-Optimization Engine</span>
              </CardTitle>
              <CardDescription>
                Continuous workflow optimization based on performance data and ML insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Active Optimizations</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div>
                          <h4 className="font-medium text-sm">Approval Path Optimization</h4>
                          <p className="text-xs text-gray-600">Reducing approval time by 23%</p>
                        </div>
                        <Badge className="bg-green-100 text-green-700">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div>
                          <h4 className="font-medium text-sm">Resource Allocation</h4>
                          <p className="text-xs text-gray-600">Optimizing agent workload distribution</p>
                        </div>
                        <Badge className="bg-blue-100 text-blue-700">Learning</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                        <div>
                          <h4 className="font-medium text-sm">Error Reduction</h4>
                          <p className="text-xs text-gray-600">Identifying common failure patterns</p>
                        </div>
                        <Badge className="bg-yellow-100 text-yellow-700">Analyzing</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Performance Metrics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Processing Speed</span>
                          <div className="flex items-center space-x-2">
                            <TrendingUp className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium">+15%</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Error Rate</span>
                          <div className="flex items-center space-x-2">
                            <TrendingUp className="h-4 w-4 text-green-600 rotate-180" />
                            <span className="text-sm font-medium">-8%</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Resource Efficiency</span>
                          <div className="flex items-center space-x-2">
                            <TrendingUp className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium">+12%</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">User Satisfaction</span>
                          <div className="flex items-center space-x-2">
                            <TrendingUp className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium">+7%</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
