import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Bot, Clock, CheckCircle, AlertCircle, Users, FileText, Shield, Calculator, CreditCard, Building, Search, Zap, Eye, Send, Mail, UserCheck, ClipboardCheck, Phone, Star, Award, TrendingUp, DollarSign, Play, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { VisualWorkflowDiagram } from './VisualWorkflowDiagram';
import { WorkflowChatbot } from './WorkflowChatbot';
import { supabase } from '@/integrations/supabase/client';

interface WorkflowStep {
  id: string;
  name: string;
  type: 'form' | 'ai_analysis' | 'review' | 'approval' | 'assessment' | 'validation' | 'processing' | 'notification' | 'automated_check' | 'verification' | 'evaluation';
  description: string;
  assignee?: string;
  duration: string;
  icon: string;
  conditions?: {
    approved?: string;
    rejected?: string;
  };
}

interface AIWorkflowGeneratorProps {
  generatedWorkflow: any;
  setGeneratedWorkflow: (workflow: any) => void;
  workflowData: any;
  setWorkflowData: (data: any) => void;
}

export const AIWorkflowGenerator: React.FC<AIWorkflowGeneratorProps> = ({
  generatedWorkflow,
  setGeneratedWorkflow,
  workflowData,
  setWorkflowData
}) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isChatbotMinimized, setIsChatbotMinimized] = useState(true);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);

  // UNIVERSAL INTELLIGENT WORKFLOW ANALYZER - Works for ANY scenario
  const analyzeWorkflowFromDescription = (description: string): WorkflowStep[] => {
    const steps: WorkflowStep[] = [];
    let stepCounter = 1;
    
    const text = description.toLowerCase();
    const words = text.split(/\s+/);
    const sentences = description.split(/[.!?]+/).filter(s => s.trim().length > 0);

    console.log('Universal AI Analysis - Processing any business scenario:', description);

    // Helper to create comprehensive steps
    const createStep = (name: string, type: WorkflowStep['type'], description: string, duration: string, icon: string, assignee?: string) => {
      const step: WorkflowStep = {
        id: `step_${stepCounter++}`,
        name,
        type,
        description,
        duration,
        icon,
        assignee
      };
      
      if (type === 'approval') {
        step.conditions = {
          approved: 'Proceed to next approval level',
          rejected: 'Return for revision or terminate process'
        };
      }
      
      return step;
    };

    // UNIVERSAL DETECTION - Extract amounts and complexity indicators
    const amountMatches = description.match(/\$[\d,]+(?:\.\d{2})?/g);
    let detectedAmount = 0;
    if (amountMatches && amountMatches.length > 0) {
      const amountStr = amountMatches[0].replace(/[\$,]/g, '');
      detectedAmount = parseInt(amountStr);
    }

    // Complexity scoring for any scenario
    const complexityScore = sentences.length + 
      (words.filter(w => ['urgent', 'critical', 'important', 'major', 'significant'].includes(w)).length * 2) +
      (detectedAmount > 0 ? Math.log10(detectedAmount) : 0);

    console.log('Complexity Score:', complexityScore, 'Amount:', detectedAmount);

    // 1. UNIVERSAL INITIAL SUBMISSION
    steps.push(createStep(
      'Request Initiation & Documentation',
      'form',
      'Submit comprehensive request with all supporting documentation, business justification, and required details',
      '30-45 minutes',
      'FileText'
    ));

    // 2. UNIVERSAL DOCUMENT VALIDATION
    steps.push(createStep(
      'Documentation Review & Validation',
      'verification',
      'Verify completeness of all required documents, validate data accuracy, and ensure compliance with submission requirements',
      '1-2 hours',
      'Shield',
      'Document Review Team'
    ));

    // 3. UNIVERSAL INITIAL ASSESSMENT
    steps.push(createStep(
      'Initial Impact Assessment',
      'assessment',
      'Preliminary evaluation of request feasibility, resource requirements, risk factors, and alignment with organizational objectives',
      '2-4 hours',
      'Eye',
      'Process Analyst'
    ));

    // 4. UNIVERSAL TECHNICAL/OPERATIONAL REVIEW
    steps.push(createStep(
      'Technical & Operational Review',
      'review',
      'Detailed technical evaluation, operational impact analysis, and resource availability assessment',
      '1-2 days',
      'Search',
      'Technical Review Team'
    ));

    // 5-8. UNIVERSAL MULTI-LEVEL APPROVAL HIERARCHY
    // Level 1: Immediate Supervisor/Department Head
    steps.push(createStep(
      'Supervisor/Department Approval',
      'approval',
      'First-level management review and approval within departmental authority limits',
      '4-24 hours',
      'Users',
      'Department Manager'
    ));

    // Level 2: Senior Management (for complex requests or higher amounts)
    if (complexityScore > 5 || detectedAmount >= 5000) {
      steps.push(createStep(
        'Senior Management Review',
        'approval',
        'Senior management evaluation of strategic implications, budget impact, and cross-departmental coordination',
        '1-3 days',
        'Award',
        'Senior Management'
      ));
    }

    // Level 3: Executive Leadership (for high-value or strategic requests)
    if (complexityScore > 8 || detectedAmount >= 25000) {
      steps.push(createStep(
        'Executive Leadership Approval',
        'approval',
        'C-level executive review for high-impact decisions, strategic initiatives, and significant resource allocation',
        '2-5 days',
        'Star',
        'Executive Leadership'
      ));
    }

    // Level 4: Board/Governance (for major strategic decisions)
    if (complexityScore > 12 || detectedAmount >= 100000) {
      steps.push(createStep(
        'Board/Governance Approval',
        'approval',
        'Board-level approval for major strategic decisions, large capital expenditures, and organizational changes',
        '1-2 weeks',
        'Building',
        'Board of Directors'
      ));
    }

    // 9. UNIVERSAL FINANCE REVIEW (for any financial impact)
    if (detectedAmount > 0 || words.some(w => ['budget', 'cost', 'expense', 'financial', 'money'].includes(w))) {
      steps.push(createStep(
        'Financial Analysis & Approval',
        'validation',
        'Comprehensive financial review including budget impact, cash flow analysis, and accounting procedures',
        '1-3 days',
        'Calculator',
        'Finance Department'
      ));
    }

    // 10. UNIVERSAL LEGAL/COMPLIANCE REVIEW (for regulated activities)
    if (complexityScore > 6 || words.some(w => ['contract', 'agreement', 'legal', 'compliance', 'regulation', 'policy'].includes(w))) {
      steps.push(createStep(
        'Legal & Compliance Review',
        'validation',
        'Legal assessment for regulatory compliance, contractual obligations, and risk mitigation',
        '2-5 days',
        'Shield',
        'Legal & Compliance'
      ));
    }

    // 11. UNIVERSAL RISK ASSESSMENT (for complex requests)
    if (complexityScore > 7) {
      steps.push(createStep(
        'Risk Assessment & Mitigation',
        'evaluation',
        'Comprehensive risk analysis, mitigation strategy development, and contingency planning',
        '1-2 days',
        'AlertCircle',
        'Risk Management'
      ));
    }

    // 12. UNIVERSAL IMPLEMENTATION PLANNING
    steps.push(createStep(
      'Implementation Planning & Setup',
      'processing',
      'Detailed implementation planning, resource allocation, milestone definition, and execution preparation',
      '2-5 days',
      'Zap',
      'Implementation Team'
    ));

    // 13. UNIVERSAL STAKEHOLDER COMMUNICATION
    steps.push(createStep(
      'Stakeholder Notification & Communication',
      'notification',
      'Comprehensive communication to all affected parties, status updates, and next step coordination',
      '2-4 hours',
      'Mail',
      'Communications Team'
    ));

    // 14. UNIVERSAL EXECUTION MONITORING
    steps.push(createStep(
      'Execution Monitoring & Tracking',
      'automated_check',
      'Ongoing monitoring of implementation progress, milestone tracking, and performance measurement',
      'Ongoing',
      'TrendingUp',
      'Project Management Office'
    ));

    // 15. UNIVERSAL COMPLETION VERIFICATION
    steps.push(createStep(
      'Completion Verification & Sign-off',
      'verification',
      'Final verification of deliverables, stakeholder sign-off, and process completion documentation',
      '1-2 days',
      'CheckCircle',
      'Quality Assurance'
    ));

    console.log(`Generated ${steps.length} universal workflow steps for complexity score: ${complexityScore}`);
    return steps;
  };

  const generateWorkflow = async () => {
    if (!prompt.trim()) {
      toast.error('Please describe the workflow you want to create');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Use the universal analyzer
      const steps = analyzeWorkflowFromDescription(prompt);
      
      // Generate intelligent workflow name from the description
      const sentences = prompt.split(/[.!?]/);
      let workflowName = 'Custom Business Process';
      
      if (sentences.length > 0) {
        const firstSentence = sentences[0].trim();
        if (firstSentence.length < 60) {
          workflowName = firstSentence.charAt(0).toUpperCase() + firstSentence.slice(1);
        } else {
          // Extract key nouns for naming
          const words = firstSentence.toLowerCase().split(/\s+/);
          const keyWords = words.filter(w => w.length > 3 && !['that', 'with', 'from', 'they', 'this', 'have', 'will', 'been'].includes(w));
          if (keyWords.length > 0) {
            workflowName = keyWords.slice(0, 3).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') + ' Process';
          }
        }
      }
      
      const workflow = {
        id: `ai-generated-${Date.now()}`,
        name: workflowName,
        description: prompt.slice(0, 200) + (prompt.length > 200 ? '...' : ''),
        type: 'universal_workflow',
        steps: steps,
        created_at: new Date().toISOString(),
        status: 'draft',
        estimated_duration: calculateTotalDuration(steps)
      };
      
      setGeneratedWorkflow(workflow);
      setWorkflowData(workflow);
      
      toast.success(`Generated intelligent workflow with ${steps.length} steps!`);
      
    } catch (error) {
      console.error('Error generating workflow:', error);
      toast.error('Failed to generate workflow. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const calculateTotalDuration = (steps: WorkflowStep[]): string => {
    // Intelligent duration calculation based on step complexity
    let totalMinutes = 0;
    
    steps.forEach(step => {
      const durationStr = step.duration.toLowerCase();
      
      if (durationStr.includes('minute')) {
        const minutes = parseInt(durationStr.match(/\d+/)?.[0] || '15');
        totalMinutes += minutes;
      } else if (durationStr.includes('hour')) {
        const hours = parseInt(durationStr.match(/\d+/)?.[0] || '2');
        totalMinutes += hours * 60;
      } else if (durationStr.includes('day')) {
        const days = parseInt(durationStr.match(/\d+/)?.[0] || '1');
        totalMinutes += days * 24 * 60;
      } else if (durationStr.includes('ongoing')) {
        // Don't add to total for ongoing processes
        return;
      } else {
        // Default fallback
        totalMinutes += 60; // 1 hour
      }
    });

    if (totalMinutes < 60) {
      return `${totalMinutes} minutes`;
    } else if (totalMinutes < 1440) { // Less than a day
      const hours = Math.round(totalMinutes / 60);
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    } else {
      const days = Math.round(totalMinutes / 1440);
      return `${days} day${days !== 1 ? 's' : ''}`;
    }
  };

  const getStepIcon = (iconName: string) => {
    const icons = {
      FileText, Bot, Users, CheckCircle, AlertCircle, Clock, Shield, Calculator, CreditCard, Building,
      Search, Zap, Eye, Send, Mail, UserCheck, ClipboardCheck, Phone, Star, Award, TrendingUp, DollarSign
    };
    return icons[iconName as keyof typeof icons] || FileText;
  };

  const getTypeColor = (type: string) => {
    const colors = {
      form: 'bg-blue-100 text-blue-800',
      ai_analysis: 'bg-purple-100 text-purple-800',
      review: 'bg-yellow-100 text-yellow-800',
      approval: 'bg-green-100 text-green-800',
      assessment: 'bg-orange-100 text-orange-800',
      validation: 'bg-red-100 text-red-800',
      verification: 'bg-cyan-100 text-cyan-800',
      processing: 'bg-indigo-100 text-indigo-800',
      notification: 'bg-pink-100 text-pink-800',
      automated_check: 'bg-teal-100 text-teal-800',
      evaluation: 'bg-amber-100 text-amber-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const executeWorkflow = async () => {
    if (!generatedWorkflow) {
      toast.error('No workflow to execute');
      return;
    }

    setIsExecuting(true);
    
    try {
      console.log('Starting workflow execution for:', generatedWorkflow.name);
      
      // Save workflow to database first
      const { data: workflowExecution, error: insertError } = await supabase
        .from('workflow_executions')
        .insert({
          workflow_name: generatedWorkflow.name,
          workflow_type: generatedWorkflow.type || 'universal_workflow',
          submitter_name: 'System User',
          request_data: {
            description: generatedWorkflow.description,
            steps: generatedWorkflow.steps,
            estimated_duration: generatedWorkflow.estimated_duration,
            workflow_name: generatedWorkflow.name
          },
          status: 'pending'
        })
        .select()
        .single();

      if (insertError) {
        console.error('Database insert error:', insertError);
        throw new Error(`Failed to save workflow: ${insertError.message}`);
      }

      console.log('Workflow saved to database:', workflowExecution);

      // Execute the workflow using edge function
      const { data, error } = await supabase.functions.invoke('execute-workflow', {
        body: { workflowId: workflowExecution.id }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(`Execution failed: ${error.message}`);
      }

      console.log('Workflow execution response:', data);
      toast.success(`Workflow executed successfully! ${data.stepsProcessed} steps processed.`);
      
      // Update workflow status
      setGeneratedWorkflow({
        ...generatedWorkflow,
        status: 'in_progress',
        id: workflowExecution.id
      });

    } catch (error) {
      console.error('Workflow execution error:', error);
      toast.error(`Failed to execute workflow: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsExecuting(false);
    }
  };

  const deployWorkflow = async () => {
    if (!generatedWorkflow) {
      toast.error('No workflow to deploy');
      return;
    }

    setIsDeploying(true);
    
    try {
      console.log('Deploying workflow as template:', generatedWorkflow.name);
      
      // Save as template for future use
      const { error: templateError } = await supabase
        .from('workflow_templates')
        .insert({
          name: generatedWorkflow.name,
          type: generatedWorkflow.type || 'universal_workflow',
          definition: {
            steps: generatedWorkflow.steps.map(step => ({
              id: step.id,
              name: step.name,
              type: step.type,
              role: step.assignee,
              description: step.description,
              duration: step.duration,
              conditions: step.conditions ? 
                Object.entries(step.conditions).map(([key, value]) => ({
                  field: key,
                  operator: '==',
                  value: value
                })) : []
            }))
          },
          active: true,
          version: 1
        });

      if (templateError) {
        console.error('Template deployment error:', templateError);
        throw new Error(`Failed to deploy template: ${templateError.message}`);
      }

      toast.success('Workflow deployed as template successfully!');
      
    } catch (error) {
      console.error('Workflow deployment error:', error);
      toast.error(`Failed to deploy workflow: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-purple-50">
        <CardHeader className="bg-gradient-to-r from-pink-500 to-violet-500 text-white rounded-t-lg">
          <div className="flex items-center space-x-3">
            <Sparkles className="h-6 w-6" />
            <div>
              <CardTitle className="text-xl">🧠 Universal AI Workflow Generator</CardTitle>
              <CardDescription className="text-pink-100">
                Intelligent workflow creation for ANY business scenario - automatically generates comprehensive multi-level approval processes
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Describe ANY business process or scenario:
              </label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Examples - ANY business process works:&#10;&#10;• Marketing campaign approval for $150,000&#10;• New employee onboarding process&#10;• Equipment purchase request&#10;• Policy change implementation&#10;• Contract negotiation workflow&#10;• Budget allocation process&#10;• Vendor selection and approval&#10;&#10;I'll create a comprehensive workflow with proper approval levels, stakeholder involvement, and detailed steps!"
                rows={8}
                className="w-full"
              />
            </div>
            
            <Button
              onClick={generateWorkflow}
              disabled={isGenerating || !prompt.trim()}
              className="w-full bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  🧠 AI Analyzing & Creating Universal Workflow...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  🚀 Generate Intelligent Workflow
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {generatedWorkflow && (
        <>
          {/* Action Buttons */}
          <div className="flex gap-4 mb-6">
            <Button
              onClick={executeWorkflow}
              disabled={isExecuting}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isExecuting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Executing...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Execute Workflow
                </>
              )}
            </Button>
            
            <Button
              onClick={deployWorkflow}
              disabled={isDeploying}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isDeploying ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deploying...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Deploy as Template
                </>
              )}
            </Button>
          </div>

          {/* VISUAL WORKFLOW DIAGRAM ONLY */}
          <div className="mt-8 mb-32">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <Zap className="h-6 w-6 mr-2 text-purple-600" />
              Workflow Process Diagram
            </h3>
            <VisualWorkflowDiagram workflow={generatedWorkflow} />
          </div>

          {/* WORKFLOW CHATBOT - POSITIONED ON LEFT */}
          <WorkflowChatbot
            workflow={generatedWorkflow}
            onWorkflowUpdate={setGeneratedWorkflow}
            isMinimized={isChatbotMinimized}
            onToggleMinimize={() => setIsChatbotMinimized(!isChatbotMinimized)}
          />
        </>
      )}
    </div>
  );
};
