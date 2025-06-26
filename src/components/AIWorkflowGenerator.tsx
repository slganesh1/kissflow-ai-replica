
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Wand2, Brain, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface AIWorkflowGeneratorProps {
  onWorkflowGenerated?: (workflow: any) => void;
}

export const AIWorkflowGenerator: React.FC<AIWorkflowGeneratorProps> = ({ onWorkflowGenerated }) => {
  const [description, setDescription] = useState('');
  const [workflowType, setWorkflowType] = useState('');
  const [urgency, setUrgency] = useState('');
  const [complexity, setComplexity] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateWorkflow = async () => {
    if (!description.trim()) {
      toast.error('Please describe what workflow you need');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Simulate AI generation with realistic delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate workflow based on input
      const generatedWorkflow = {
        id: `wf_${Date.now()}`,
        workflow_name: `AI Generated: ${description.substring(0, 50)}...`,
        workflow_type: workflowType || 'ai_generated',
        status: 'active',
        created_at: new Date().toISOString(),
        request_data: {
          description,
          urgency: urgency || 'medium',
          complexity: complexity || 'medium'
        },
        steps: generateStepsBasedOnDescription(description, workflowType)
      };

      toast.success('Workflow generated successfully!');
      
      // Call the callback to update parent component
      if (onWorkflowGenerated) {
        onWorkflowGenerated(generatedWorkflow);
      }
      
    } catch (error) {
      toast.error('Failed to generate workflow');
      console.error('Workflow generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateStepsBasedOnDescription = (desc: string, type: string) => {
    const lowerDesc = desc.toLowerCase();
    const steps = [];

    // Add initial step
    steps.push({
      id: 'init',
      name: 'Request Initiated',
      type: 'trigger',
      description: 'Workflow started from AI generation',
      status: 'completed'
    });

    // Generate steps based on keywords and type
    if (lowerDesc.includes('approval') || lowerDesc.includes('approve')) {
      steps.push({
        id: 'review',
        name: 'AI Analysis & Review',
        type: 'ai-processing',
        description: 'AI analyzes the request and determines approval requirements',
        status: 'active'
      });
      
      steps.push({
        id: 'approval',
        name: 'Human Approval Required',
        type: 'approval',
        description: 'Manager or authorized person reviews and approves the request',
        status: 'pending'
      });
    }

    if (lowerDesc.includes('document') || lowerDesc.includes('file')) {
      steps.push({
        id: 'doc-process',
        name: 'Document Processing',
        type: 'ai-processing',
        description: 'AI processes and validates submitted documents',
        status: lowerDesc.includes('approval') ? 'pending' : 'active'
      });
    }

    if (lowerDesc.includes('email') || lowerDesc.includes('notification')) {
      steps.push({
        id: 'notify',
        name: 'Send Notifications',
        type: 'notification',
        description: 'Automated email notifications to relevant parties',
        status: 'pending'
      });
    }

    // Add completion step
    steps.push({
      id: 'complete',
      name: 'Workflow Complete',
      type: 'end',
      description: 'All steps completed successfully',
      status: 'pending'
    });

    return steps;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Brain className="h-5 w-5 text-purple-600" />
          <span>AI Workflow Generator</span>
        </CardTitle>
        <CardDescription>
          Describe your business process and let AI create an intelligent workflow for you
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="description">Workflow Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the process you want to automate (e.g., 'Expense approval workflow that requires manager approval for amounts over $500')"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="workflow-type">Workflow Type</Label>
            <Select value={workflowType} onValueChange={setWorkflowType}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="approval">Approval Process</SelectItem>
                <SelectItem value="data_processing">Data Processing</SelectItem>
                <SelectItem value="customer_service">Customer Service</SelectItem>
                <SelectItem value="finance">Finance & Accounting</SelectItem>
                <SelectItem value="hr">Human Resources</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="operations">Operations</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="urgency">Urgency Level</Label>
            <Select value={urgency} onValueChange={setUrgency}>
              <SelectTrigger>
                <SelectValue placeholder="Select urgency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low - Standard processing</SelectItem>
                <SelectItem value="medium">Medium - Moderate priority</SelectItem>
                <SelectItem value="high">High - Urgent processing</SelectItem>
                <SelectItem value="critical">Critical - Immediate attention</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="complexity">Process Complexity</Label>
            <Select value={complexity} onValueChange={setComplexity}>
              <SelectTrigger>
                <SelectValue placeholder="Select complexity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="simple">Simple - 2-3 steps</SelectItem>
                <SelectItem value="medium">Medium - 4-6 steps</SelectItem>
                <SelectItem value="complex">Complex - 7+ steps</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-center pt-4">
          <Button 
            onClick={generateWorkflow}
            disabled={isGenerating || !description.trim()}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Sparkles className="h-5 w-5 mr-2 animate-spin" />
                Generating Workflow...
              </>
            ) : (
              <>
                <Wand2 className="h-5 w-5 mr-2" />
                Generate AI Workflow
              </>
            )}
          </Button>
        </div>

        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
          <div className="flex items-start space-x-3">
            <Zap className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">AI-Powered Intelligence</h4>
              <p className="text-sm text-blue-700">
                Our AI analyzes your description to create optimized workflows with intelligent routing, 
                automated decision points, and smart approvals based on your business rules.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
