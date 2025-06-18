
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Zap, 
  Target, 
  Brain, 
  Activity,
  Lightbulb,
  ArrowUp,
  ArrowDown,
  Settings
} from 'lucide-react';

const performanceData = [
  { time: '00:00', efficiency: 78, throughput: 45, errors: 3 },
  { time: '04:00', efficiency: 82, throughput: 52, errors: 2 },
  { time: '08:00', efficiency: 88, throughput: 68, errors: 1 },
  { time: '12:00', efficiency: 91, throughput: 89, errors: 2 },
  { time: '16:00', efficiency: 85, throughput: 76, errors: 4 },
  { time: '20:00', efficiency: 89, throughput: 63, errors: 1 },
];

const optimizationMetrics = [
  {
    name: 'Customer Onboarding',
    currentTime: 2.4,
    optimizedTime: 1.8,
    improvement: 25,
    status: 'optimized',
    suggestions: 3
  },
  {
    name: 'Invoice Processing',
    currentTime: 4.2,
    optimizedTime: 3.1,
    improvement: 26,
    status: 'in-progress',
    suggestions: 5
  },
  {
    name: 'Support Routing',
    currentTime: 0.8,
    optimizedTime: 0.6,
    improvement: 25,
    status: 'pending',
    suggestions: 2
  },
  {
    name: 'Data Pipeline',
    currentTime: 6.5,
    optimizedTime: 4.2,
    improvement: 35,
    status: 'optimized',
    suggestions: 4
  }
];

const recommendations = [
  {
    id: 1,
    type: 'performance',
    title: 'Optimize Document Processing Pipeline',
    description: 'Parallel processing can reduce document analysis time by 40%',
    impact: 'high',
    effort: 'medium',
    savings: '2.3 hours/day',
    confidence: 94
  },
  {
    id: 2,
    type: 'bottleneck',
    title: 'Add Auto-Approval for Low-Risk Invoices',
    description: 'Invoices under $500 from verified vendors can skip manual review',
    impact: 'high',
    effort: 'low',
    savings: '1.8 hours/day',
    confidence: 87
  },
  {
    id: 3,
    type: 'resource',
    title: 'Redistribute Peak Hour Workload',
    description: 'Schedule non-urgent tasks during off-peak hours (2-6 AM)',
    impact: 'medium',
    effort: 'low',
    savings: '15% faster processing',
    confidence: 92
  },
  {
    id: 4,
    type: 'automation',
    title: 'Implement Smart Error Recovery',
    description: 'Automatically retry failed processes with adjusted parameters',
    impact: 'medium',
    effort: 'high',
    savings: '0.9 hours/day',
    confidence: 78
  }
];

const getImpactBadge = (impact) => {
  const colors = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-gray-100 text-gray-800'
  };
  return <Badge className={colors[impact]}>{impact} impact</Badge>;
};

const getEffortBadge = (effort) => {
  const colors = {
    high: 'bg-orange-100 text-orange-800',
    medium: 'bg-blue-100 text-blue-800',
    low: 'bg-green-100 text-green-800'
  };
  return <Badge variant="outline" className={colors[effort]}>{effort} effort</Badge>;
};

export const ContinuousOptimizer = () => {
  const [optimizationScore, setOptimizationScore] = useState(87);
  const [activeOptimizations, setActiveOptimizations] = useState(3);

  useEffect(() => {
    // Simulate real-time optimization score updates
    const interval = setInterval(() => {
      setOptimizationScore(prev => prev + (Math.random() - 0.5) * 2);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Continuous Optimization Engine</h2>
          <p className="text-gray-600">AI-powered workflow optimization and performance enhancement</p>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700">
          <Brain className="h-4 w-4 mr-2" />
          Run Analysis
        </Button>
      </div>

      {/* Optimization Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-800">Optimization Score</p>
                <p className="text-2xl font-bold text-purple-900">{Math.round(optimizationScore)}%</p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mt-2">
              <Progress value={optimizationScore} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800">Active Optimizations</p>
                <p className="text-2xl font-bold text-green-900">{activeOptimizations}</p>
              </div>
              <Activity className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800">Time Saved Today</p>
                <p className="text-2xl font-bold text-blue-900">8.4h</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-800">Efficiency Gain</p>
                <p className="text-2xl font-bold text-amber-900">+23%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="performance">Performance Analytics</TabsTrigger>
          <TabsTrigger value="workflows">Workflow Optimization</TabsTrigger>
          <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="performance">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Real-time Performance Metrics</CardTitle>
                <CardDescription>System efficiency, throughput, and error rates over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="efficiency" stroke="#8b5cf6" strokeWidth={2} />
                    <Line type="monotone" dataKey="throughput" stroke="#10b981" strokeWidth={2} />
                    <Line type="monotone" dataKey="errors" stroke="#ef4444" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Peak Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600 mb-1">91%</div>
                  <p className="text-sm text-gray-600">Achieved at 12:00 PM</p>
                  <div className="flex items-center mt-2">
                    <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">+13% from average</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Bottleneck Alert</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-amber-600 mb-1">4:00 PM</div>
                  <p className="text-sm text-gray-600">Document processing queue</p>
                  <div className="flex items-center mt-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500 mr-1" />
                    <span className="text-sm text-amber-600">Needs attention</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Error Recovery</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600 mb-1">98.2%</div>
                  <p className="text-sm text-gray-600">Auto-recovery success rate</p>
                  <div className="flex items-center mt-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">Excellent</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="workflows">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Optimization Status</CardTitle>
              <CardDescription>Current vs optimized performance for each workflow</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {optimizationMetrics.map((workflow, index) => (
                  <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-lg">{workflow.name}</h3>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={workflow.status === 'optimized' ? 'default' : 'secondary'}
                          className={workflow.status === 'optimized' ? 'bg-green-100 text-green-800' : ''}
                        >
                          {workflow.status}
                        </Badge>
                        <Lightbulb className="h-4 w-4 text-amber-500" />
                        <span className="text-sm text-gray-600">{workflow.suggestions} suggestions</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Current Time</p>
                        <p className="text-xl font-bold">{workflow.currentTime}h</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Optimized Time</p>
                        <p className="text-xl font-bold text-green-600">{workflow.optimizedTime}h</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Improvement</p>
                        <div className="flex items-center">
                          <p className="text-xl font-bold text-blue-600">{workflow.improvement}%</p>
                          <ArrowDown className="h-4 w-4 text-green-500 ml-1" />
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Button 
                          size="sm" 
                          variant={workflow.status === 'optimized' ? 'outline' : 'default'}
                          className={workflow.status === 'optimized' ? '' : 'bg-blue-600 hover:bg-blue-700'}
                        >
                          {workflow.status === 'optimized' ? 'View Details' : 'Apply Optimization'}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations">
          <div className="space-y-4">
            {recommendations.map((rec) => (
              <Card key={rec.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Lightbulb className="h-5 w-5 text-amber-500" />
                        <h3 className="font-semibold text-lg">{rec.title}</h3>
                      </div>
                      <p className="text-gray-600 mb-3">{rec.description}</p>
                      <div className="flex items-center space-x-4">
                        {getImpactBadge(rec.impact)}
                        {getEffortBadge(rec.effort)}
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          {rec.confidence}% confidence
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-2xl font-bold text-green-600">{rec.savings}</p>
                      <p className="text-sm text-gray-500">estimated savings</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Settings className="h-4 w-4" />
                      <span>Implementation complexity: {rec.effort}</span>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        Learn More
                      </Button>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        Implement
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
