
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Sparkles, 
  Play, 
  Save, 
  Download, 
  ArrowRight, 
  CheckCircle, 
  Clock, 
  User, 
  FileText,
  Users,
  Shield,
  Zap,
  Upload
} from 'lucide-react';
import { toast } from 'sonner';
import { WorkflowChatbot } from './WorkflowChatbot';
import { supabase } from '@/integrations/supabase/client';

interface WorkflowStep {
  id: string;
  name: string;
  type: string;
  assignee: string;
  duration: string;
  description: string;
  level: number;
  conditions?: {
    approved: string;
    rejected: string;
  };
}

interface GeneratedWorkflow {
  id: string;
  name: string;
  description: string;
  type: string;
  estimated_duration: string;
  steps: WorkflowStep[];
  created_at: string;
  status: string;
}

export const AIWorkflowGenerator = ({ 
  generatedWorkflow, 
  setGeneratedWorkflow, 
  workflowData, 
  setWorkflowData 
}: any) => {
  const [businessProcess, setBusinessProcess] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [isChatbotMinimized, setIsChatbotMinimized] = useState(true);
  const [savedWorkflowId, setSavedWorkflowId] = useState<string | null>(null);

  // Load saved workflow from localStorage on component mount
  useEffect(() => {
    const savedWorkflow = localStorage.getItem('aiGeneratedWorkflow');
    if (savedWorkflow && !generatedWorkflow) {
      try {
        const parsedWorkflow = JSON.parse(savedWorkflow);
        setGeneratedWorkflow(parsedWorkflow);
        setWorkflowData(parsedWorkflow);
        console.log('Loaded saved workflow from localStorage:', parsedWorkflow);
      } catch (error) {
        console.error('Error loading saved workflow:', error);
        localStorage.removeItem('aiGeneratedWorkflow');
      }
    }
  }, []);

  // Save workflow to localStorage whenever it changes
  useEffect(() => {
    if (generatedWorkflow) {
      localStorage.setItem('aiGeneratedWorkflow', JSON.stringify(generatedWorkflow));
      console.log('Saved workflow to localStorage:', generatedWorkflow);
    }
  }, [generatedWorkflow]);

  const generateWorkflow = async () => {
    if (!businessProcess.trim()) {
      toast.error('Please describe your business process');
      return;
    }

    setIsGenerating(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const processName = businessProcess.substring(0, 50) + (businessProcess.length > 50 ? '...' : '');
      const steps = generateIntelligentWorkflow(businessProcess);
      
      const workflow: GeneratedWorkflow = {
        id: `workflow-${Date.now()}`,
        name: `${processName} - AI Workflow`,
        description: `AI-generated workflow for: ${businessProcess}`,
        type: 'ai-generated',
        estimated_duration: calculateEstimatedDuration(steps),
        steps: steps,
        created_at: new Date().toISOString(),
        status: 'draft'
      };

      setGeneratedWorkflow(workflow);
      setWorkflowData(workflow);
      toast.success('Workflow generated successfully!');
      
    } catch (error) {
      console.error('Error generating workflow:', error);
      toast.error('Failed to generate workflow');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateIntelligentWorkflow = (description: string): WorkflowStep[] => {
    const lowerDesc = description.toLowerCase();
    const steps: WorkflowStep[] = [];
    
    // Initial Request Processing
    steps.push({
      id: 'step-1',
      name: 'Request Initiation',
      type: 'form',
      assignee: 'Requester',
      duration: '15 minutes',
      description: 'Submit initial request with required documentation',
      level: 1
    });

    steps.push({
      id: 'step-2',
      name: 'Document Validation',
      type: 'validation',
      assignee: 'System',
      duration: '5 minutes',
      description: 'Automated validation of submitted documents and data',
      level: 1
    });

    steps.push({
      id: 'step-3',
      name: 'Initial Review',
      type: 'review',
      assignee: 'Supervisor',
      duration: '2 hours',
      description: 'Preliminary review for completeness and compliance',
      level: 2
    });

    // Conditional approval levels based on complexity
    if (lowerDesc.includes('high') || lowerDesc.includes('critical') || lowerDesc.includes('executive')) {
      steps.push({
        id: 'step-4',
        name: 'Senior Management Review',
        type: 'approval',
        assignee: 'Senior Manager',
        duration: '1 day',
        description: 'Senior management approval for high-impact requests',
        level: 3
      });
    }

    if (lowerDesc.includes('financial') || lowerDesc.includes('budget') || lowerDesc.includes('expense')) {
      steps.push({
        id: 'step-5',
        name: 'Financial Approval',
        type: 'approval',
        assignee: 'Finance Manager',
        duration: '4 hours',
        description: 'Financial review and budget approval',
        level: 3
      });
    }

    if (lowerDesc.includes('legal') || lowerDesc.includes('contract') || lowerDesc.includes('compliance')) {
      steps.push({
        id: 'step-6',
        name: 'Legal Compliance Review',
        type: 'approval',
        assignee: 'Legal Team',
        duration: '2 days',
        description: 'Legal compliance and risk assessment',
        level: 4
      });
    }

    // Final approval and processing
    steps.push({
      id: `step-${steps.length + 1}`,
      name: 'Final Approval',
      type: 'approval',
      assignee: 'Department Head',
      duration: '1 day',
      description: 'Final authorization and approval decision',
      level: 4
    });

    steps.push({
      id: `step-${steps.length + 1}`,
      name: 'Implementation Planning',
      type: 'processing',
      assignee: 'Project Manager',
      duration: '4 hours',
      description: 'Create implementation plan and timeline',
      level: 5
    });

    steps.push({
      id: `step-${steps.length + 1}`,
      name: 'Process Execution',
      type: 'processing',
      assignee: 'Operations Team',
      duration: '1-5 days',
      description: 'Execute the approved process or request',
      level: 6
    });

    steps.push({
      id: `step-${steps.length + 1}`,
      name: 'Quality Assurance',
      type: 'validation',
      assignee: 'QA Team',
      duration: '4 hours',
      description: 'Quality check and validation of completed work',
      level: 6
    });

    steps.push({
      id: `step-${steps.length + 1}`,
      name: 'Documentation & Closure',
      type: 'processing',
      assignee: 'Administrator',
      duration: '1 hour',
      description: 'Complete documentation and close the workflow',
      level: 7
    });

    return steps;
  };

  const calculateEstimatedDuration = (steps: WorkflowStep[]): string => {
    let totalHours = 0;
    
    steps.forEach(step => {
      const duration = step.duration.toLowerCase();
      if (duration.includes('minute')) {
        const minutes = parseInt(duration.match(/\d+/)?.[0] || '0');
        totalHours += minutes / 60;
      } else if (duration.includes('hour')) {
        const hours = parseInt(duration.match(/\d+/)?.[0] || '0');
        totalHours += hours;
      } else if (duration.includes('day')) {
        const days = parseInt(duration.match(/\d+/)?.[0] || '0');
        totalHours += days * 8;
      }
    });

    if (totalHours < 1) {
      return `${Math.round(totalHours * 60)} minutes`;
    } else if (totalHours < 24) {
      return `${Math.round(totalHours)} hours`;
    } else {
      const days = Math.round(totalHours / 8);
      return `${days} business days`;
    }
  };

  const saveWorkflow = async () => {
    if (!generatedWorkflow) {
      toast.error('No workflow to save');
      return;
    }

    setIsSaving(true);
    try {
      const { data, error } = await supabase
        .from('workflow_templates')
        .insert({
          name: generatedWorkflow.name,
          type: generatedWorkflow.type,
          definition: {
            description: generatedWorkflow.description,
            estimated_duration: generatedWorkflow.estimated_duration,
            steps: generatedWorkflow.steps
          },
          active: false
        })
        .select()
        .single();

      if (error) throw error;

      setSavedWorkflowId(data.id);
      toast.success('Workflow saved to templates!');
      console.log('Saved workflow:', data);
      
    } catch (error) {
      console.error('Error saving workflow:', error);
      toast.error('Failed to save workflow');
    } finally {
      setIsSaving(false);
    }
  };

  const deployWorkflow = async () => {
    if (!generatedWorkflow) {
      toast.error('No workflow to deploy');
      return;
    }

    setIsDeploying(true);
    try {
      const { data, error } = await supabase
        .from('workflow_templates')
        .insert({
          name: generatedWorkflow.name,
          type: generatedWorkflow.type,
          definition: {
            description: generatedWorkflow.description,
            estimated_duration: generatedWorkflow.estimated_duration,
            steps: generatedWorkflow.steps
          },
          active: true
        })
        .select()
        .single();

      if (error) throw error;

      setSavedWorkflowId(data.id);
      toast.success('Workflow deployed and activated!');
      console.log('Deployed workflow:', data);
      
    } catch (error) {
      console.error('Error deploying workflow:', error);
      toast.error('Failed to deploy workflow');
    } finally {
      setIsDeploying(false);
    }
  };

  const executeWorkflow = async () => {
    if (!generatedWorkflow) {
      toast.error('No workflow to execute');
      return;
    }

    setIsExecuting(true);
    try {
      // Create workflow execution record
      const { data: execution, error: execError } = await supabase
        .from('workflow_executions')
        .insert({
          workflow_name: generatedWorkflow.name,
          workflow_type: generatedWorkflow.type,
          submitter_name: 'AI Generator User', 
          request_data: {
            description: generatedWorkflow.description,
            steps: generatedWorkflow.steps,
            estimated_duration: generatedWorkflow.estimated_duration,
            business_process: businessProcess,
            ai_generated: true
          }
        })
        .select()
        .single();

      if (execError) throw execError;

      console.log('Created workflow execution:', execution);

      // Execute the workflow via edge function
      const { data: result, error: functionError } = await supabase.functions.invoke('execute-workflow', {
        body: { workflowId: execution.id }
      });

      if (functionError) throw functionError;

      toast.success('Workflow executed successfully! Check Active Workflows tab.');
      console.log('Execution result:', result);
      
    } catch (error) {
      console.error('Error executing workflow:', error);
      toast.error(`Failed to execute workflow: ${error.message}`);
    } finally {
      setIsExecuting(false);
    }
  };

  const clearWorkflow = () => {
    setGeneratedWorkflow(null);
    setWorkflowData(null);
    localStorage.removeItem('aiGeneratedWorkflow');
    setSavedWorkflowId(null);
    setBusinessProcess('');
    toast.success('Workflow cleared');
  };

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'form': return <FileText className="h-4 w-4" />;
      case 'approval': return <CheckCircle className="h-4 w-4" />;
      case 'review': return <User className="h-4 w-4" />;
      case 'validation': return <Shield className="h-4 w-4" />;
      case 'processing': return <Zap className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStepColor = (type: string) => {
    switch (type) {
      case 'form': return 'from-blue-400 to-blue-600';
      case 'approval': return 'from-green-400 to-green-600';
      case 'review': return 'from-yellow-400 to-yellow-600';
      case 'validation': return 'from-purple-400 to-purple-600';
      case 'processing': return 'from-orange-400 to-orange-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="bg-gradient-to-r from-pink-500 to-violet-500 text-white rounded-t-lg">
          <CardTitle className="text-xl flex items-center space-x-2">
            <Sparkles className="h-6 w-6" />
            <span>AI Workflow Generator</span>
          </CardTitle>
          <CardDescription className="text-pink-100">
            Describe your business process and let AI generate an intelligent workflow
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="business-process">Describe Your Business Process</Label>
              <Textarea
                id="business-process"
                placeholder="Example: Employee onboarding process including document verification, system access setup, and manager approval..."
                value={businessProcess}
                onChange={(e) => setBusinessProcess(e.target.value)}
                rows={4}
                className="mt-2"
              />
            </div>
            
            <div className="flex space-x-2">
              <Button 
                onClick={generateWorkflow} 
                disabled={isGenerating || !businessProcess.trim()}
                className="flex-1 bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Workflow
                  </>
                )}
              </Button>
              
              {generatedWorkflow && (
                <Button variant="outline" onClick={clearWorkflow}>
                  Clear
                </Button>
              )}
            </div>
          </div>

          {generatedWorkflow && (
            <>
              <Separator />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Generated Workflow</h3>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={saveWorkflow}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin mr-2" />
                      ) : (
                        <Save className="h-4 w-4 mr-1" />
                      )}
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={deployWorkflow}
                      disabled={isDeploying}
                    >
                      {isDeploying ? (
                        <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin mr-2" />
                      ) : (
                        <Upload className="h-4 w-4 mr-1" />
                      )}
                      Deploy
                    </Button>
                    <Button
                      size="sm"
                      onClick={executeWorkflow}
                      disabled={isExecuting}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                    >
                      {isExecuting ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      ) : (
                        <Play className="h-4 w-4 mr-1" />
                      )}
                      Execute
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                  <div className="text-center">
                    <h4 className="font-medium text-gray-700">Workflow Name</h4>
                    <p className="text-sm text-gray-600">{generatedWorkflow.name}</p>
                  </div>
                  <div className="text-center">
                    <h4 className="font-medium text-gray-700">Total Steps</h4>
                    <p className="text-sm text-gray-600">{generatedWorkflow.steps.length} steps</p>
                  </div>
                  <div className="text-center">
                    <h4 className="font-medium text-gray-700">Estimated Duration</h4>
                    <p className="text-sm text-gray-600">{generatedWorkflow.estimated_duration}</p>
                  </div>
                </div>

                <div className="bg-white border rounded-lg p-4">
                  <h4 className="font-medium mb-4">Workflow Flow Diagram</h4>
                  <div className="space-y-2">
                    {generatedWorkflow.steps.map((step, index) => (
                      <div key={step.id} className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${getStepColor(step.type)} flex items-center justify-center text-white`}>
                          {getStepIcon(step.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{step.name}</span>
                            <div className="flex items-center space-x-2">
                              <Badge variant="secondary" className="text-xs">{step.type}</Badge>
                              <span className="text-xs text-gray-500">{step.duration}</span>
                            </div>
                          </div>
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Assignee:</span> {step.assignee} | 
                            <span className="font-medium"> Description:</span> {step.description}
                          </div>
                        </div>
                        {index < generatedWorkflow.steps.length - 1 && (
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {savedWorkflowId && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-700">
                      ✅ Workflow saved with ID: {savedWorkflowId}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {generatedWorkflow && (
        <WorkflowChatbot
          workflow={generatedWorkflow}
          isMinimized={isChatbotMinimized}
          onToggleMinimize={() => setIsChatbotMinimized(!isChatbotMinimized)}
        />
      )}
    </div>
  );
};
