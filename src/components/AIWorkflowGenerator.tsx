
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Sparkles, 
  Play, 
  Save, 
  Upload,
  CheckCircle, 
  Clock, 
  User, 
  FileText,
  Shield,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { Copy, Download } from 'lucide-react';
import { WorkflowChatbot } from './WorkflowChatbot';
import { VisualWorkflowDiagram } from './VisualWorkflowDiagram';
import { supabase } from '@/integrations/supabase/client';

interface WorkflowStep {
  id: string;
  name: string;
  type: string;
  assignee: string;
  duration: string;
  description: string;
  level: number;
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
      console.log('Generating workflow with OpenAI for:', businessProcess);
      
      const { data, error } = await supabase.functions.invoke('generate-ai-workflow', {
        body: { businessProcess: businessProcess.trim() }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Failed to generate workflow');
      }

      if (!data || !data.workflow) {
        throw new Error('No workflow data received from AI');
      }

      const workflow = data.workflow;
      console.log('OpenAI Generated workflow:', workflow);

      setGeneratedWorkflow(workflow);
      setWorkflowData(workflow);
      toast.success('AI-powered workflow generated successfully!');
      
    } catch (error) {
      console.error('Error generating workflow:', error);
      toast.error(`Failed to generate workflow: ${error.message}`);
    } finally {
      setIsGenerating(false);
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

  const exportToJson = () => {
    if (!generatedWorkflow) {
      toast.error('No workflow to export');
      return;
    }

    // Create the JSON format that the testing app expects
    const exportData = {
      name: generatedWorkflow.name,
      description: generatedWorkflow.description,
      type: generatedWorkflow.type,
      estimated_duration: generatedWorkflow.estimated_duration,
      steps: generatedWorkflow.steps.map((step, index) => ({
        id: step.id || `step-${index}`,
        name: step.name,
        type: step.type === 'review' ? 'approval' : step.type,
        role: step.assignee,
        description: step.description,
        duration: step.duration
      }))
    };

    // Copy to clipboard
    navigator.clipboard.writeText(JSON.stringify(exportData, null, 2)).then(() => {
      toast.success('Workflow JSON copied to clipboard! 📋\nPaste it in the Workflow Tester → Import Workflow tab');
    }).catch(() => {
      // Fallback: Create download link
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${generatedWorkflow.name.replace(/\s+/g, '_')}_workflow.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Workflow JSON downloaded!');
    });
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
            Describe your business process and let real AI generate an intelligent workflow
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
                    Generating with OpenAI...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate with AI
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
                  <h3 className="text-lg font-semibold">AI-Generated Workflow</h3>
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
                      variant="outline"
                      size="sm"
                      onClick={exportToJson}
                      className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Export for Testing
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

                {/* Visual Workflow Diagram */}
                <div className="mt-6">
                  <VisualWorkflowDiagram workflow={generatedWorkflow} />
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
