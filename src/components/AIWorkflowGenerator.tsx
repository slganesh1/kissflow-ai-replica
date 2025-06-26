
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Wand2, ArrowRight, CheckCircle, Clock, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { WorkflowInputForm } from './WorkflowInputForm';
import { supabase } from '@/integrations/supabase/client';

interface GeneratedWorkflow {
  id: string;
  name: string;
  type: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  steps: Array<{
    id: string;
    name: string;
    type: string;
    description: string;
    status: 'pending' | 'approved' | 'rejected';
  }>;
  submitter_name: string;
  created_at: string;
  request_data: any;
}

export const AIWorkflowGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedWorkflow, setGeneratedWorkflow] = useState<GeneratedWorkflow | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [activeWorkflows, setActiveWorkflows] = useState<GeneratedWorkflow[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch active workflows
  const fetchActiveWorkflows = async () => {
    try {
      setLoading(true);
      console.log('Fetching active workflows for AI generator...');
      
      const { data: workflows, error: workflowError } = await supabase
        .from('workflow_executions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (workflowError) {
        console.error('Error fetching workflows:', workflowError);
        return;
      }

      console.log('Fetched workflows:', workflows);

      // Fetch approvals for these workflows
      const workflowIds = workflows?.map(w => w.id) || [];
      let approvalsByWorkflow = {};
      
      if (workflowIds.length > 0) {
        const { data: approvals, error: approvalError } = await supabase
          .from('workflow_approvals')
          .select('*')
          .in('workflow_id', workflowIds);

        if (approvalError) {
          console.error('Error fetching approvals:', approvalError);
        } else {
          // Group approvals by workflow_id
          approvalsByWorkflow = (approvals || []).reduce((acc, approval) => {
            if (!acc[approval.workflow_id]) {
              acc[approval.workflow_id] = [];
            }
            acc[approval.workflow_id].push(approval);
            return acc;
          }, {} as { [key: string]: any[] });
        }
      }

      // Transform workflows to include approval steps
      const transformedWorkflows = workflows?.map(workflow => ({
        id: workflow.id,
        name: workflow.workflow_name,
        type: workflow.workflow_type,
        description: workflow.request_data?.business_purpose || 'No description',
        status: workflow.status,
        submitter_name: workflow.submitter_name,
        created_at: workflow.created_at,
        request_data: workflow.request_data,
        steps: (approvalsByWorkflow[workflow.id] || []).map(approval => ({
          id: approval.step_id,
          name: approval.step_name,
          type: approval.approver_role,
          description: `${approval.step_name} (${approval.approver_role})`,
          status: approval.status
        }))
      })) || [];

      console.log('Transformed workflows with steps:', transformedWorkflows);
      setActiveWorkflows(transformedWorkflows);
    } catch (error) {
      console.error('Error in fetchActiveWorkflows:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveWorkflows();
    
    // Set up real-time subscription for workflow changes
    const channel = supabase
      .channel('ai_workflow_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'workflow_executions' },
        (payload) => {
          console.log('Workflow change detected in AI generator:', payload);
          fetchActiveWorkflows();
        }
      )
      .on(
        'postgres_changes',  
        { event: '*', schema: 'public', table: 'workflow_approvals' },
        (payload) => {
          console.log('Approval change detected in AI generator:', payload);
          fetchActiveWorkflows();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const generateWorkflow = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a workflow description');
      return;
    }

    setIsGenerating(true);

    try {
      // Simulate AI generation with realistic workflow based on prompt
      await new Promise(resolve => setTimeout(resolve, 2000));

      let workflowType = 'general_workflow';
      let workflowName = 'Generated Workflow';
      let steps = [];

      // Analyze prompt to determine workflow type and steps
      const lowerPrompt = prompt.toLowerCase();
      
      if (lowerPrompt.includes('expense') || lowerPrompt.includes('cost') || lowerPrompt.includes('budget')) {
        workflowType = 'expense_approval';
        workflowName = 'AI Generated Expense Approval';
        
        // Check if high value expense
        const hasHighValue = lowerPrompt.includes('1000') || lowerPrompt.includes('thousand') || lowerPrompt.includes('high');
        
        if (hasHighValue) {
          steps = [
            { id: 'manager-approval', name: 'Manager Approval', type: 'approval', description: 'Manager review and approval', status: 'pending' },
            { id: 'finance-director-approval', name: 'Finance Director Approval', type: 'approval', description: 'Finance director final approval', status: 'pending' }
          ];
        } else {
          steps = [
            { id: 'manager-approval', name: 'Manager Approval', type: 'approval', description: 'Manager review and approval', status: 'pending' }
          ];
        }
      } else if (lowerPrompt.includes('campaign') || lowerPrompt.includes('marketing')) {
        workflowType = 'campaign_approval';
        workflowName = 'AI Generated Campaign Approval';
        steps = [
          { id: 'content-review', name: 'Content Review', type: 'review', description: 'Review campaign content and messaging', status: 'pending' },
          { id: 'manager-approval', name: 'Manager Approval', type: 'approval', description: 'Final campaign approval', status: 'pending' }
        ];
      } else {
        workflowName = `AI Generated: ${prompt.substring(0, 50)}${prompt.length > 50 ? '...' : ''}`;
        steps = [
          { id: 'review-step', name: 'Review Step', type: 'review', description: 'Review and validate request', status: 'pending' },
          { id: 'approval-step', name: 'Approval Step', type: 'approval', description: 'Final approval required', status: 'pending' }
        ];
      }

      const generated: GeneratedWorkflow = {
        id: `ai-generated-${Date.now()}`,
        name: workflowName,
        type: workflowType,
        description: prompt,
        status: 'pending',
        steps,
        submitter_name: 'AI Generator',
        created_at: new Date().toISOString(),
        request_data: {
          title: workflowName,
          business_purpose: prompt,
          generated_by_ai: true,
          created_at: new Date().toISOString()
        }
      };

      setGeneratedWorkflow(generated);
      toast.success('Workflow generated successfully!');
    } catch (error) {
      console.error('Error generating workflow:', error);
      toast.error('Failed to generate workflow');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleWorkflowSubmit = async (data: Record<string, any>) => {
    try {
      console.log('Submitting AI generated workflow:', data);
      
      // Reset the form and generated workflow
      setGeneratedWorkflow(null);
      setShowForm(false);
      setPrompt('');
      
      toast.success('AI generated workflow submitted successfully!');
      
      // Refresh the active workflows list
      await fetchActiveWorkflows();
    } catch (error) {
      console.error('Error submitting workflow:', error);
      toast.error('Failed to submit workflow');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'completed': return 'bg-green-100 text-green-800 border-green-300';
      case 'failed': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'in_progress': return <AlertCircle className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'failed': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (showForm && generatedWorkflow) {
    return (
      <WorkflowInputForm
        workflowName={generatedWorkflow.name}
        workflowType={generatedWorkflow.type}
        onSubmit={handleWorkflowSubmit}
        onCancel={() => {
          setShowForm(false);
          setGeneratedWorkflow(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Sparkles className="h-6 w-6 text-purple-600" />
            <div>
              <CardTitle>AI Workflow Generator</CardTitle>
              <CardDescription>
                Describe your workflow in natural language and let AI generate it for you
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="workflow-prompt">Describe your workflow</Label>
            <Textarea
              id="workflow-prompt"
              placeholder="e.g., 'Create a marketing expense approval workflow for purchases over $1000 that requires both manager and finance director approval'"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              className="mt-2"
            />
          </div>
          
          <Button 
            onClick={generateWorkflow}
            disabled={isGenerating || !prompt.trim()}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Wand2 className="h-4 w-4 mr-2 animate-spin" />
                Generating Workflow...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Workflow
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedWorkflow && (
        <Card className="border-purple-200 bg-purple-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-purple-800">Generated Workflow</CardTitle>
                <CardDescription className="text-purple-600">
                  Review and customize your AI-generated workflow
                </CardDescription>
              </div>
              <Badge className="bg-purple-100 text-purple-700 border-purple-300">
                AI Generated
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-purple-800">{generatedWorkflow.name}</h4>
              <p className="text-sm text-purple-700 mt-1">{generatedWorkflow.description}</p>
            </div>

            <div className="space-y-3">
              <h5 className="font-medium text-purple-800">Workflow Steps:</h5>
              <div className="space-y-2">
                {generatedWorkflow.steps.map((step, index) => (
                  <div key={step.id} className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-purple-200">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-purple-700">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{step.name}</p>
                      <p className="text-sm text-gray-600">{step.description}</p>
                    </div>
                    <Badge variant="outline" className="text-orange-600 border-orange-300">
                      Pending
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button 
                onClick={() => setShowForm(true)}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                Customize & Submit
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setGeneratedWorkflow(null)}
              >
                Discard
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Workflows Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent AI Generated Workflows</CardTitle>
              <CardDescription>Track your AI-generated and submitted workflows</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={fetchActiveWorkflows} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-gray-500">Loading workflows...</p>
          ) : activeWorkflows.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No workflows found</p>
              <p className="text-sm text-gray-400 mt-1">Generate your first AI workflow above!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeWorkflows.map((workflow) => (
                <div key={workflow.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{workflow.name}</h4>
                    <Badge className={getStatusColor(workflow.status)} variant="outline">
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(workflow.status)}
                        <span className="capitalize">{workflow.status.replace('_', ' ')}</span>
                      </div>
                    </Badge>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-3">
                    <p><strong>Type:</strong> {workflow.type}</p>
                    <p><strong>Submitter:</strong> {workflow.submitter_name}</p>
                    <p><strong>Created:</strong> {new Date(workflow.created_at).toLocaleDateString()} at {new Date(workflow.created_at).toLocaleTimeString()}</p>
                    <p><strong>Description:</strong> {workflow.description}</p>
                  </div>

                  {workflow.steps.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">Approval Steps:</p>
                      <div className="flex flex-wrap gap-2">
                        {workflow.steps.map((step) => (
                          <Badge 
                            key={step.id} 
                            variant="outline" 
                            className={
                              step.status === 'approved' ? 'bg-green-100 text-green-700 border-green-300' :
                              step.status === 'rejected' ? 'bg-red-100 text-red-700 border-red-300' :
                              'bg-yellow-100 text-yellow-700 border-yellow-300'
                            }
                          >
                            {step.name}: {step.status}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">
                      ID: {workflow.id.substring(0, 8)}...
                    </Badge>
                    {workflow.request_data?.amount && (
                      <Badge variant="outline" className="text-sm">
                        Amount: ${workflow.request_data.amount}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
