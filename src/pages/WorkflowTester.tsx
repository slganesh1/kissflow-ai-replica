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
  },
  {
    id: 'procurement',
    name: 'Procurement Request',
    description: 'Test multi-level procurement approval workflow',
    expectedOutcome: 'Purchase order created and vendor notified',
    steps: [
      { id: 'submit', name: 'Submit Request', type: 'automation', status: 'pending' },
      { id: 'budget-check', name: 'Budget Validation', type: 'decision', status: 'pending' },
      { id: 'manager', name: 'Manager Approval', type: 'approval', role: 'manager', status: 'pending' },
      { id: 'procurement', name: 'Procurement Review', type: 'approval', role: 'procurement', status: 'pending' },
      { id: 'finance', name: 'Finance Approval', type: 'approval', role: 'finance', status: 'pending' },
      { id: 'po-creation', name: 'Create Purchase Order', type: 'automation', status: 'pending' }
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
  const [customWorkflow, setCustomWorkflow] = useState({
    name: '',
    description: '',
    steps: [] as WorkflowStep[]
  });
  const [importedWorkflowJson, setImportedWorkflowJson] = useState('');

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
      // Create actual workflow execution in database
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
              role: step.role
            })),
            test_mode: true
          } as any
        })
        .select()
        .single();

      if (execError) throw execError;

      // Execute the workflow using real edge function
      const { data: result, error: functionError } = await supabase.functions.invoke('execute-workflow', {
        body: { workflowId: execution.id }
      });

      if (functionError) throw functionError;

      return execution.id;
    } catch (error) {
      console.error('Real workflow execution failed:', error);
      throw error;
    }
  };

  const monitorRealWorkflow = async (workflowId: string) => {
    // Monitor real workflow progress from database
    const { data: execution, error } = await supabase
      .from('workflow_executions')
      .select('*')
      .eq('id', workflowId)
      .single();

    if (error) {
      console.error('Error monitoring workflow:', error);
      return;
    }

    // Get real approval steps
    const { data: approvals } = await supabase
      .from('workflow_approvals')
      .select('*')
      .eq('workflow_id', workflowId)
      .order('order_sequence', { ascending: true });

    // Update UI with real data
    if (selectedScenario && approvals) {
      const updatedSteps = selectedScenario.steps.map((step, index) => {
        const approval = approvals[index];
        if (approval) {
          return {
            ...step,
            status: (approval.status === 'approved' ? 'completed' : 
                   approval.status === 'rejected' ? 'failed' : 
                   approval.status === 'pending' ? 'pending' : 'running') as WorkflowStep['status']
          };
        }
        return step;
      });

      setSelectedScenario({
        ...selectedScenario,
        steps: updatedSteps
      });
    }
  };

  const runRealWorkflowTest = async () => {
    if (!selectedScenario) return;
    
    setIsRunning(true);
    setCurrentStepIndex(0);
    setTestResults([]);
    
    // Reset all steps to pending
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
      title: "Real Workflow Started",
      description: `Executing real workflow: ${selectedScenario.name}`,
    });

    try {
      // Execute real workflow
      const workflowId = await executeRealWorkflow(selectedScenario);
      
      // Monitor progress every 2 seconds
      const monitorInterval = setInterval(async () => {
        await monitorRealWorkflow(workflowId);
      }, 2000);

      // Stop monitoring after 30 seconds (or when complete)
      setTimeout(() => {
        clearInterval(monitorInterval);
        setIsRunning(false);
        setCurrentStepIndex(-1);
      }, 30000);

      setTestResults([`Real workflow executed with ID: ${workflowId}`]);

      toast({
        title: "Real Workflow Executed",
        description: "Check the Active Workflows tab to see real-time progress",
      });

    } catch (error) {
      console.error('Real workflow execution failed:', error);
      setIsRunning(false);
      setCurrentStepIndex(-1);
      
      toast({
        title: "Execution Failed",
        description: `Failed to execute real workflow: ${error}`,
        variant: "destructive"
      });
    }
  };

  const simulateStepExecution = async (step: WorkflowStep): Promise<boolean> => {
    // Simulate different execution times and outcomes
    const executionTime = Math.random() * 2000 + 500; // 0.5-2.5 seconds
    const successRate = step.type === 'approval' ? 0.8 : 0.95; // Approvals more likely to need manual intervention
    
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
    
    // Reset all steps to pending
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
      
      // Update step to running
      setSelectedScenario(prev => {
        if (!prev) return null;
        const updatedSteps = [...prev.steps];
        updatedSteps[i] = { ...updatedSteps[i], status: 'running' };
        return { ...prev, steps: updatedSteps };
      });

      const success = await simulateStepExecution(selectedScenario.steps[i]);
      
      // Update step with final status
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

  const addCustomStep = () => {
    const newStep: WorkflowStep = {
      id: `step-${Date.now()}`,
      name: 'New Step',
      type: 'automation',
      status: 'pending'
    };
    
    setCustomWorkflow(prev => ({
      ...prev,
      steps: [...prev.steps, newStep]
    }));
  };

  const updateCustomStep = (index: number, updates: Partial<WorkflowStep>) => {
    setCustomWorkflow(prev => ({
      ...prev,
      steps: prev.steps.map((step, i) => 
        i === index ? { ...step, ...updates } : step
      )
    }));
  };

  const removeCustomStep = (index: number) => {
    setCustomWorkflow(prev => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index)
    }));
  };

  const saveCustomWorkflow = () => {
    if (!customWorkflow.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a workflow name",
        variant: "destructive"
      });
      return;
    }

    const newScenario: TestScenario = {
      id: `custom-${Date.now()}`,
      name: customWorkflow.name,
      description: customWorkflow.description || 'Custom workflow test',
      expectedOutcome: 'Custom test completion',
      steps: customWorkflow.steps
    };

    TEST_SCENARIOS.push(newScenario);
    setSelectedScenario(newScenario);

    toast({
      title: "Custom Workflow Saved",
      description: `Created test scenario: ${customWorkflow.name}`,
    });

    // Reset custom workflow form
    setCustomWorkflow({
      name: '',
      description: '',
      steps: []
    });
  };

  const importWorkflowFromJson = () => {
    if (!importedWorkflowJson.trim()) {
      toast({
        title: "Error",
        description: "Please paste a workflow JSON",
        variant: "destructive"
      });
      return;
    }

    try {
      const workflowData = JSON.parse(importedWorkflowJson);
      
      // Convert the imported workflow to our test scenario format
      const convertedSteps: WorkflowStep[] = [];
      
      if (workflowData.steps && Array.isArray(workflowData.steps)) {
        workflowData.steps.forEach((step: any, index: number) => {
          convertedSteps.push({
            id: step.id || `step-${index}`,
            name: step.name || step.title || `Step ${index + 1}`,
            type: step.type || 'automation',
            role: step.role || step.assignee,
            status: 'pending'
          });
        });
      } else if (workflowData.approvalSteps) {
        // Handle approval-specific workflow format
        workflowData.approvalSteps.forEach((step: any, index: number) => {
          convertedSteps.push({
            id: step.stepId || `approval-${index}`,
            name: step.stepName || `Approval Step ${index + 1}`,
            type: 'approval',
            role: step.approverRole,
            status: 'pending'
          });
        });
      }

      const importedScenario: TestScenario = {
        id: `imported-${Date.now()}`,
        name: workflowData.name || workflowData.workflowName || 'Imported Workflow',
        description: workflowData.description || 'Workflow imported from JSON',
        expectedOutcome: 'Imported workflow execution completed',
        steps: convertedSteps
      };

      setSelectedScenario(importedScenario);
      setTestResults([]);

      toast({
        title: "Workflow Imported",
        description: `Successfully imported "${importedScenario.name}" with ${convertedSteps.length} steps`,
      });

    } catch (error) {
      toast({
        title: "Import Error",
        description: "Invalid JSON format. Please check your workflow JSON and try again.",
        variant: "destructive"
      });
    }
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

        <Tabs defaultValue="test-scenarios" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="test-scenarios">Test Scenarios</TabsTrigger>
            <TabsTrigger value="import-workflow">Import Workflow</TabsTrigger>
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
                <div className="space-y-2">
                  <Label htmlFor="workflow-json">Paste Workflow JSON</Label>
                  <Textarea
                    id="workflow-json"
                    value={importedWorkflowJson}
                    onChange={(e) => setImportedWorkflowJson(e.target.value)}
                    placeholder={`Paste your exported workflow JSON here...

Example:
{
  "name": "Sample Workflow",
  "description": "Test workflow",
  "steps": [
    {
      "id": "step1",
      "name": "Submit Request",
      "type": "automation"
    },
    {
      "id": "step2", 
      "name": "Manager Approval",
      "type": "approval",
      "role": "manager"
    }
  ]
}`}
                    className="min-h-[200px] font-mono text-sm"
                  />
                </div>
                
                <Button 
                  onClick={importWorkflowFromJson}
                  className="w-full"
                  disabled={!importedWorkflowJson.trim()}
                >
                  Import & Load Workflow
                </Button>

                <div className="text-sm text-muted-foreground">
                  <p className="font-medium mb-2">Supported JSON formats:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Workflows with <code>steps</code> array</li>
                    <li>Workflows with <code>approvalSteps</code> array</li>
                    <li>Any workflow exported from the main app</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="custom-workflow" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Create Custom Workflow</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="workflow-name">Workflow Name</Label>
                    <Input
                      id="workflow-name"
                      value={customWorkflow.name}
                      onChange={(e) => setCustomWorkflow(prev => ({
                        ...prev,
                        name: e.target.value
                      }))}
                      placeholder="Enter workflow name..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="workflow-description">Description</Label>
                    <Input
                      id="workflow-description"
                      value={customWorkflow.description}
                      onChange={(e) => setCustomWorkflow(prev => ({
                        ...prev,
                        description: e.target.value
                      }))}
                      placeholder="Brief description..."
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold">Workflow Steps</h4>
                    <Button onClick={addCustomStep} size="sm">
                      Add Step
                    </Button>
                  </div>

                  {customWorkflow.steps.map((step, index) => (
                    <div key={step.id} className="grid grid-cols-4 gap-2 items-end p-3 border rounded-lg">
                      <div className="space-y-2">
                        <Label>Step Name</Label>
                        <Input
                          value={step.name}
                          onChange={(e) => updateCustomStep(index, { name: e.target.value })}
                          placeholder="Step name..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Type</Label>
                        <Select
                          value={step.type}
                          onValueChange={(value: WorkflowStep['type']) => 
                            updateCustomStep(index, { type: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="automation">Automation</SelectItem>
                            <SelectItem value="approval">Approval</SelectItem>
                            <SelectItem value="notification">Notification</SelectItem>
                            <SelectItem value="decision">Decision</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Role (if applicable)</Label>
                        <Input
                          value={step.role || ''}
                          onChange={(e) => updateCustomStep(index, { role: e.target.value })}
                          placeholder="Role..."
                        />
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeCustomStep(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>

                <Button onClick={saveCustomWorkflow} className="w-full">
                  Save Custom Workflow
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
                    {testResults.map((result, index) => (
                      <div 
                        key={index}
                        className={`p-2 rounded text-sm font-mono ${
                          result.includes('PASSED') 
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                      >
                        {result}
                      </div>
                    ))}
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