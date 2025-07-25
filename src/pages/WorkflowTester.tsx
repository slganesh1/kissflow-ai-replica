import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Navigation } from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  User,
  Settings,
  FileText
} from 'lucide-react';

interface WorkflowStep {
  id: string;
  name: string;
  type: 'approval' | 'notification' | 'automation' | 'decision';
  role?: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'rejected';
  duration?: number;
  error?: string;
}

interface TestScenario {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  expectedOutcome: string;
}

const TEST_SCENARIOS: TestScenario[] = [
  {
    id: 'expense-approval',
    name: 'Expense Approval',
    description: 'Test expense approval workflow with manager and finance approval',
    expectedOutcome: 'Approved by both manager and finance',
    steps: [
      { id: 'submit', name: 'Submit Expense', type: 'automation', status: 'pending' },
      { id: 'manager', name: 'Manager Approval', type: 'approval', role: 'manager', status: 'pending' },
      { id: 'finance', name: 'Finance Review', type: 'approval', role: 'finance', status: 'pending' },
      { id: 'notification', name: 'Send Confirmation', type: 'notification', status: 'pending' }
    ]
  },
  {
    id: 'leave-request',
    name: 'Leave Request',
    description: 'Test leave request with HR approval and calendar integration',
    expectedOutcome: 'Leave approved and calendar updated',
    steps: [
      { id: 'submit', name: 'Submit Leave Request', type: 'automation', status: 'pending' },
      { id: 'hr-check', name: 'HR Policy Check', type: 'decision', status: 'pending' },
      { id: 'hr-approval', name: 'HR Approval', type: 'approval', role: 'hr', status: 'pending' },
      { id: 'calendar', name: 'Update Calendar', type: 'automation', status: 'pending' },
      { id: 'notify', name: 'Notify Team', type: 'notification', status: 'pending' }
    ]
  }
];

export function WorkflowTester() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [selectedScenario, setSelectedScenario] = useState<TestScenario | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [testResults, setTestResults] = useState<string[]>([]);
  const [importedJson, setImportedJson] = useState('');
  const [customWorkflowName, setCustomWorkflowName] = useState('');
  const [customWorkflowDescription, setCustomWorkflowDescription] = useState('');
  const [activeTab, setActiveTab] = useState('test-scenarios');

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse delay-75"></div>
              <div className="w-3 h-3 bg-pink-500 rounded-full animate-pulse delay-150"></div>
            </div>
          </div>
          <p className="text-lg text-gray-700">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const stepIcons = {
    approval: User,
    notification: FileText,
    automation: Settings,
    decision: AlertTriangle
  };

  const statusColors = {
    pending: 'text-muted-foreground',
    running: 'text-blue-500',
    completed: 'text-green-500',
    failed: 'text-red-500',
    rejected: 'text-orange-500'
  };

  const statusBadgeVariants = {
    pending: 'secondary' as const,
    running: 'default' as const,
    completed: 'default' as const,
    failed: 'destructive' as const,
    rejected: 'destructive' as const
  };

  const executeRealWorkflow = async (scenario: TestScenario): Promise<string> => {
    try {
      console.log('Starting real workflow execution for:', scenario.name);
      
      const { data: execution, error: execError } = await supabase
        .from('workflow_executions')
        .insert({
          workflow_name: scenario.name,
          workflow_type: 'test_scenario',
          submitter_name: 'Workflow Tester',
          request_data: {
            description: scenario.description,
            expected_outcome: scenario.expectedOutcome,
            steps: scenario.steps.map(step => ({
              id: step.id,
              name: step.name,
              type: step.type,
              assignee: step.role || 'manager',
              description: `Test step: ${step.name}`,
              duration: '1 hour'
            })),
            test_mode: true
          }
        })
        .select()
        .single();

      if (execError) {
        console.error('Database insert error:', execError);
        throw execError;
      }

      console.log('Workflow created with ID:', execution.id);

      const { data: result, error: functionError } = await supabase.functions.invoke('execute-workflow', {
        body: { workflowId: execution.id }
      });

      if (functionError) {
        console.error('Edge function error:', functionError);
        throw functionError;
      }

      console.log('Edge function result:', result);
      return execution.id;
    } catch (error) {
      console.error('Real workflow execution failed:', error);
      throw error;
    }
  };

  const runRealWorkflowTest = async () => {
    if (!selectedScenario) return;
    
    setIsRunning(true);
    setCurrentStepIndex(0);
    setTestResults([]);

    toast({
      title: "Real Workflow Started",
      description: `Executing real workflow: ${selectedScenario.name}`,
    });

    try {
      const workflowId = await executeRealWorkflow(selectedScenario);
      
      setTestResults([
        `✅ Real workflow created with ID: ${workflowId}`,
        `📝 Workflow inserted into database`,
        `🚀 Edge function executed successfully`,
        `👥 Approval tasks created for relevant steps`,
        `📊 Check Active Workflows tab for real-time status`,
        `📋 Check Approval Dashboard for pending approvals`
      ]);

      toast({
        title: "Real Workflow Executed Successfully",
        description: "Workflow is now active in the system. Check Active Workflows and Approval Dashboard.",
      });

    } catch (error: any) {
      console.error('Real workflow execution failed:', error);
      
      const errorMessage = error?.message || error?.toString() || 'Unknown error';
      setTestResults([
        `❌ Real workflow execution failed`,
        `Error: ${errorMessage}`,
        `Check console for detailed error information`
      ]);
      
      toast({
        title: "Execution Failed",
        description: `Failed to execute real workflow: ${errorMessage}`,
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
    }
  };

  const executeImportedWorkflow = async () => {
    if (!importedJson.trim()) {
      toast({
        title: "No JSON Provided",
        description: "Please paste a workflow JSON before executing",
        variant: "destructive"
      });
      return;
    }

    setIsRunning(true);
    setTestResults([]);

    try {
      // Parse the JSON
      const workflowData = JSON.parse(importedJson);
      
      setTestResults(prev => [...prev, `📝 JSON parsed successfully`]);
      setTestResults(prev => [...prev, `📋 Workflow name: ${workflowData.name || 'Imported Workflow'}`]);

      // Create workflow execution record
      const { data: execution, error: execError } = await supabase
        .from('workflow_executions')
        .insert({
          workflow_name: workflowData.name || 'Imported Workflow',
          workflow_type: 'imported_json',
          submitter_name: 'JSON Import',
          request_data: {
            imported_json: true,
            original_data: workflowData,
            steps: workflowData.steps || [],
            description: workflowData.description || 'Imported from JSON'
          }
        })
        .select()
        .single();

      if (execError) throw execError;

      setTestResults(prev => [...prev, `✅ Workflow record created in database with ID: ${execution.id}`]);

      // Execute the workflow
      const { data: result, error: functionError } = await supabase.functions.invoke('execute-workflow', {
        body: { workflowId: execution.id }
      });

      if (functionError) throw functionError;

      setTestResults(prev => [
        ...prev,
        `🚀 Edge function executed successfully`,
        `📊 Result: ${JSON.stringify(result)}`,
        `📋 Check Active Workflows tab for real-time status`,
        `👥 Check Approval Dashboard for any pending approvals`,
        `🔗 Navigate to Active Workflows: Go to main dashboard`,
        `📝 Workflow ID: ${execution.id} (copy this for reference)`
      ]);

      // Switch to results tab to show the execution details
      setActiveTab('results');

      toast({
        title: "JSON Workflow Executed",
        description: `Imported workflow "${workflowData.name || 'Imported Workflow'}" is now running in the system`,
      });

    } catch (error: any) {
      const errorMessage = error?.message || 'Unknown error';
      setTestResults(prev => [
        ...prev,
        `❌ Import failed: ${errorMessage}`,
        `Please check your JSON format and try again`,
        `💡 Expected format: {"name": "Workflow Name", "steps": [...]}`
      ]);

      // Switch to results tab to show the error
      setActiveTab('results');
      
      toast({
        title: "Import Failed",
        description: `Failed to import and execute workflow: ${errorMessage}`,
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
    }
  };

  const executeCustomWorkflow = async () => {
    if (!customWorkflowName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide a workflow name",
        variant: "destructive"
      });
      return;
    }

    setIsRunning(true);
    setTestResults([]);

    try {
      setTestResults(prev => [...prev, `🔨 Building custom workflow: ${customWorkflowName}`]);

      const { data: execution, error: execError } = await supabase
        .from('workflow_executions')
        .insert({
          workflow_name: customWorkflowName,
          workflow_type: 'custom_built',
          submitter_name: 'Custom Builder',
          request_data: {
            custom_built: true,
            description: customWorkflowDescription || 'Custom built workflow',
            steps: [
              {
                id: 'step-1',
                name: 'Initial Review',
                type: 'review',
                assignee: 'manager',
                description: 'Initial review of the custom workflow request'
              },
              {
                id: 'step-2', 
                name: 'Approval Required',
                type: 'approval',
                assignee: 'director',
                description: 'Director approval for custom workflow'
              }
            ]
          }
        })
        .select()
        .single();

      if (execError) throw execError;

      setTestResults(prev => [...prev, `✅ Custom workflow created with ID: ${execution.id}`]);

      const { data: result, error: functionError } = await supabase.functions.invoke('execute-workflow', {
        body: { workflowId: execution.id }
      });

      if (functionError) throw functionError;

      setTestResults(prev => [
        ...prev,
        `🚀 Custom workflow executed successfully`,
        `📊 Edge function result: ${JSON.stringify(result)}`,
        `📋 Check Active Workflows and Approval Dashboard`,
        `🔗 Workflow ID: ${execution.id}`
      ]);

      // Switch to results tab
      setActiveTab('results');

      toast({
        title: "Custom Workflow Created",
        description: `"${customWorkflowName}" is now running in the system`,
      });

    } catch (error: any) {
      const errorMessage = error?.message || 'Unknown error';
      setTestResults(prev => [
        ...prev,
        `❌ Custom workflow creation failed: ${errorMessage}`
      ]);
      
      toast({
        title: "Creation Failed", 
        description: `Failed to create custom workflow: ${errorMessage}`,
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
    }
  };

  const simulateStepExecution = async (step: WorkflowStep): Promise<boolean> => {
    const executionTime = Math.random() * 2000 + 500;
    const successRate = step.type === 'approval' ? 0.8 : 0.95;
    
    await new Promise(resolve => setTimeout(resolve, executionTime));
    
    const isSuccess = Math.random() < successRate;
    
    if (!isSuccess && step.type === 'approval') {
      step.error = 'Approval timeout - escalation required';
      return false;
    } else if (!isSuccess) {
      step.error = 'Step execution failed - retry required';
      return false;
    }
    
    return true;
  };

  const runWorkflowTest = async () => {
    if (!selectedScenario) return;
    
    setIsRunning(true);
    setCurrentStepIndex(0);
    setTestResults([]);
    
    const resetSteps = selectedScenario.steps.map(step => ({
      ...step,
      status: 'pending' as const,
      error: undefined
    }));
    
    setSelectedScenario({
      ...selectedScenario,
      steps: resetSteps
    });

    toast({
      title: "Test Started",
      description: `Running test scenario: ${selectedScenario.name}`,
    });

    for (let i = 0; i < selectedScenario.steps.length; i++) {
      setCurrentStepIndex(i);
      
      setSelectedScenario(prev => {
        if (!prev) return null;
        const updatedSteps = [...prev.steps];
        updatedSteps[i] = { ...updatedSteps[i], status: 'running' };
        return { ...prev, steps: updatedSteps };
      });

      const success = await simulateStepExecution(selectedScenario.steps[i]);
      
      setSelectedScenario(prev => {
        if (!prev) return null;
        const updatedSteps = [...prev.steps];
        updatedSteps[i] = {
          ...updatedSteps[i],
          status: success ? 'completed' : 'failed',
          error: success ? undefined : updatedSteps[i].error
        };
        return { ...prev, steps: updatedSteps };
      });

      const result = `Step ${i + 1}: ${selectedScenario.steps[i].name} - ${success ? 'PASSED' : 'FAILED'}`;
      setTestResults(prev => [...prev, result]);

      if (!success) {
        toast({
          title: "Step Failed",
          description: `${selectedScenario.steps[i].name}: ${selectedScenario.steps[i].error}`,
          variant: "destructive"
        });
        break;
      }
    }

    setIsRunning(false);
    setCurrentStepIndex(-1);

    const allCompleted = selectedScenario.steps.every(step => 
      step.status === 'completed'
    );

    toast({
      title: allCompleted ? "Test Completed Successfully" : "Test Failed",
      description: allCompleted 
        ? "All workflow steps executed successfully"
        : "Workflow execution stopped due to failure",
      variant: allCompleted ? "default" : "destructive"
    });
  };

  const resetTest = () => {
    if (!selectedScenario) return;
    
    setIsRunning(false);
    setCurrentStepIndex(0);
    setTestResults([]);
    
    const resetSteps = selectedScenario.steps.map(step => ({
      ...step,
      status: 'pending' as const,
      error: undefined
    }));
    
    setSelectedScenario({
      ...selectedScenario,
      steps: resetSteps
    });

    toast({
      title: "Test Reset",
      description: "Workflow test has been reset to initial state",
    });
  };

  const progress = selectedScenario 
    ? (selectedScenario.steps.filter(s => s.status === 'completed').length / selectedScenario.steps.length) * 100
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Workflow Testing Suite</h1>
          <p className="text-muted-foreground">
            Test and validate workflow execution with real integrations
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="test-scenarios">Test Scenarios</TabsTrigger>
            <TabsTrigger value="import-workflow">Import JSON</TabsTrigger>
            <TabsTrigger value="custom-workflow">Custom Workflow</TabsTrigger>
            <TabsTrigger value="results">Test Results</TabsTrigger>
          </TabsList>

          <TabsContent value="test-scenarios" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Select Test Scenario</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select
                  value={selectedScenario?.id || ''}
                  onValueChange={(value) => {
                    const scenario = TEST_SCENARIOS.find(s => s.id === value);
                    setSelectedScenario(scenario || null);
                    setTestResults([]);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a test scenario..." />
                  </SelectTrigger>
                  <SelectContent>
                    {TEST_SCENARIOS.map(scenario => (
                      <SelectItem key={scenario.id} value={scenario.id}>
                        {scenario.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedScenario && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold">{selectedScenario.name}</h3>
                      <p className="text-sm text-muted-foreground">{selectedScenario.description}</p>
                      <p className="text-sm font-medium mt-2">
                        Expected Outcome: {selectedScenario.expectedOutcome}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Progress</span>
                        <span className="text-sm text-muted-foreground">
                          {selectedScenario.steps.filter(s => s.status === 'completed').length} / {selectedScenario.steps.length}
                        </span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>

                    <div className="space-y-3">
                      {selectedScenario.steps.map((step, index) => {
                        const StepIcon = stepIcons[step.type];
                        const isCurrentStep = index === currentStepIndex;
                        
                        return (
                          <div 
                            key={step.id}
                            className={`flex items-center gap-3 p-3 rounded-lg border ${
                              isCurrentStep ? 'ring-2 ring-primary border-primary' : ''
                            }`}
                          >
                            <StepIcon className={`h-5 w-5 ${statusColors[step.status]}`} />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{step.name}</span>
                                <Badge variant={statusBadgeVariants[step.status]}>
                                  {step.status}
                                </Badge>
                                {step.role && (
                                  <Badge variant="outline">{step.role}</Badge>
                                )}
                              </div>
                              {step.error && (
                                <p className="text-sm text-red-500 mt-1">{step.error}</p>
                              )}
                            </div>
                            {step.status === 'completed' && (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            )}
                            {step.status === 'failed' && (
                              <XCircle className="h-5 w-5 text-red-500" />
                            )}
                            {step.status === 'running' && (
                              <Clock className="h-5 w-5 text-blue-500 animate-spin" />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        onClick={runWorkflowTest}
                        disabled={isRunning}
                        variant="outline"
                        className="flex-1"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        {isRunning ? 'Running Simulation...' : 'Run Simulation'}
                      </Button>
                      <Button 
                        onClick={runRealWorkflowTest}
                        disabled={isRunning}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        {isRunning ? 'Executing Real...' : 'Execute Real Workflow'}
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={resetTest}
                        disabled={isRunning}
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Reset
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="import-workflow" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Import Workflow JSON</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="workflow-json">Paste Workflow JSON</Label>
                  <Textarea 
                    id="workflow-json"
                    value={importedJson}
                    onChange={(e) => setImportedJson(e.target.value)}
                    placeholder='{"name": "My Workflow", "description": "Workflow description", "steps": [{"id": "step1", "name": "Review", "type": "approval", "assignee": "manager"}]}'
                    className="min-h-[200px] font-mono text-sm"
                  />
                </div>
                <Button 
                  className="w-full"
                  onClick={executeImportedWorkflow}
                  disabled={isRunning}
                >
                  {isRunning ? 'Executing...' : 'Import & Execute Real Workflow'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="custom-workflow" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Build Custom Workflow</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="workflow-name">Workflow Name</Label>
                    <Input 
                      id="workflow-name" 
                      value={customWorkflowName}
                      onChange={(e) => setCustomWorkflowName(e.target.value)}
                      placeholder="Enter workflow name" 
                    />
                  </div>
                  <div>
                    <Label htmlFor="workflow-type">Workflow Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="approval">Approval Process</SelectItem>
                        <SelectItem value="automation">Automation</SelectItem>
                        <SelectItem value="notification">Notification</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="workflow-description">Description</Label>
                  <Textarea 
                    id="workflow-description"
                    value={customWorkflowDescription}
                    onChange={(e) => setCustomWorkflowDescription(e.target.value)}
                    placeholder="Describe your workflow..."
                  />
                </div>
                <Button 
                  className="w-full"
                  onClick={executeCustomWorkflow}
                  disabled={isRunning}
                >
                  {isRunning ? 'Building & Executing...' : 'Build & Execute Real Workflow'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Test Results</CardTitle>
              </CardHeader>
              <CardContent>
                {testResults.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No test results yet. Run a workflow test to see results here.
                  </p>
                ) : (
                  <div className="space-y-2">
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm font-semibold text-blue-800">Latest Execution Results:</p>
                    </div>
                    {testResults.map((result, index) => (
                      <div 
                        key={index}
                        className={`p-3 rounded text-sm font-mono ${
                          result.includes('❌') || result.includes('failed') 
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : result.includes('✅') || result.includes('🚀')
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {result}
                      </div>
                    ))}
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        <strong>Next Steps:</strong> To see the workflow in action, go to:
                      </p>
                      <ul className="text-sm text-yellow-700 mt-1 ml-4">
                        <li>• Active Workflows tab (for real-time status)</li>
                        <li>• Approval Dashboard (for pending approvals)</li>
                      </ul>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}