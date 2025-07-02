import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Bot, Clock, CheckCircle, AlertCircle, Users, FileText, Shield, Calculator, CreditCard, Building, Search, Zap, Eye, Send, Mail, UserCheck, ClipboardCheck, Phone, Star, Award, TrendingUp, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { VisualWorkflowDiagram } from './VisualWorkflowDiagram';
import { WorkflowChatbot } from './WorkflowChatbot';

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

  // Enhanced workflow analysis with intelligent amount detection and multi-level approvals
  const analyzeWorkflowFromDescription = (description: string): WorkflowStep[] => {
    const steps: WorkflowStep[] = [];
    let stepCounter = 1;
    
    const text = description.toLowerCase();
    const sentences = description.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.split(/\s+/);

    console.log('Analyzing workflow description:', description);
    console.log('Detected sentences:', sentences.length);

    // Helper to create steps
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
          approved: 'Continue to next step',
          rejected: 'Return to submitter for revision or end process'
        };
      }
      
      return step;
    };

    // ENHANCED AMOUNT DETECTION - Extract dollar amounts
    const amountMatches = description.match(/\$[\d,]+(?:\.\d{2})?/g);
    let detectedAmount = 0;
    if (amountMatches && amountMatches.length > 0) {
      const amountStr = amountMatches[0].replace(/[\$,]/g, '');
      detectedAmount = parseInt(amountStr);
      console.log('Detected amount:', detectedAmount);
    }

    // 1. INITIAL SUBMISSION
    if (words.some(w => ['need', 'request', 'approval', 'campaign', 'project', 'purchase'].includes(w))) {
      steps.push(createStep(
        'Request Submission',
        'form',
        'Submit detailed request with all required documentation and justification',
        '15-30 minutes',
        'FileText'
      ));
    }

    // 2. DOCUMENT REVIEW & VALIDATION
    steps.push(createStep(
      'Document Review',
      'verification',
      'Verify all required documents, budgets, and supporting materials are complete',
      '30-60 minutes',
      'Shield'
    ));

    // 3. INITIAL ASSESSMENT
    if (detectedAmount > 1000 || words.some(w => ['campaign', 'marketing', 'project', 'initiative'].includes(w))) {
      steps.push(createStep(
        'Initial Assessment',
        'review',
        'Preliminary review of request feasibility, alignment with company goals, and risk assessment',
        '2-4 hours',
        'Eye'
      ));
    }

    // 4. INTELLIGENT MULTI-LEVEL APPROVAL HIERARCHY based on amount and context
    if (detectedAmount > 0 || words.some(w => ['approval', 'approve', 'budget', 'spend', 'investment'].includes(w))) {
      
      // Level 1: Department/Team Lead (for amounts > $1,000)
      if (detectedAmount >= 1000 || sentences.length > 2) {
        steps.push(createStep(
          'Department Manager Approval',
          'approval',
          'Department head reviews and approves within departmental authority limits',
          '4-24 hours',
          'Users',
          'Department Manager'
        ));
      }

      // Level 2: Senior Management (for amounts > $10,000)
      if (detectedAmount >= 10000 || words.some(w => ['senior', 'major', 'significant', 'important'].includes(w))) {
        steps.push(createStep(
          'Senior Management Review',
          'approval',
          'Senior management evaluates strategic impact and budget implications',
          '1-3 days',
          'Award',
          'Senior Management'
        ));
      }

      // Level 3: Executive/C-Level (for amounts > $50,000)
      if (detectedAmount >= 50000 || words.some(w => ['executive', 'ceo', 'urgent', 'critical', 'major campaign'].includes(w))) {
        steps.push(createStep(
          'Executive Leadership Approval',
          'approval',
          'C-level executive approval for high-value expenditures and strategic initiatives',
          '2-5 days',
          'Star',
          'Executive Leadership'
        ));
      }

      // Level 4: Board Approval (for amounts > $500,000)
      if (detectedAmount >= 500000) {
        steps.push(createStep(
          'Board of Directors Approval',
          'approval',
          'Board approval required for major capital expenditures and strategic investments',
          '1-2 weeks',
          'Building',
          'Board of Directors'
        ));
      }
    }

    // 5. FINANCE REVIEW (for budget requests)
    if (detectedAmount > 5000 || words.some(w => ['budget', 'finance', 'cost', 'expense', 'investment'].includes(w))) {
      steps.push(createStep(
        'Finance Department Review',
        'validation',
        'Finance team validates budget allocation, cash flow impact, and accounting procedures',
        '1-2 days',
        'Calculator',
        'Finance Team'
      ));
    }

    // 6. LEGAL/COMPLIANCE REVIEW (for high-value or regulated activities)
    if (detectedAmount > 25000 || words.some(w => ['legal', 'compliance', 'contract', 'agreement', 'marketing', 'campaign'].includes(w))) {
      steps.push(createStep(
        'Legal & Compliance Review',
        'validation',
        'Legal review for compliance, contracts, and regulatory requirements',
        '1-3 days',
        'Shield',
        'Legal Department'
      ));
    }

    // 7. FINAL PROCESSING
    steps.push(createStep(
      'Implementation Setup',
      'processing',
      'Set up approved processes, allocate resources, and initiate execution',
      '2-5 days',
      'Zap'
    ));

    // 8. STAKEHOLDER NOTIFICATION
    steps.push(createStep(
      'Stakeholder Notification',
      'notification',
      'Notify all relevant parties of approval decision and next steps',
      '30 minutes',
      'Mail'
    ));

    // 9. PROGRESS MONITORING (for ongoing projects)
    if (words.some(w => ['campaign', 'project', 'initiative', 'launch'].includes(w))) {
      steps.push(createStep(
        'Progress Monitoring',
        'automated_check',
        'Ongoing monitoring of project milestones and budget utilization',
        'Ongoing',
        'TrendingUp'
      ));
    }

    console.log(`Generated ${steps.length} workflow steps for amount: $${detectedAmount}`);
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

  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-purple-50">
        <CardHeader className="bg-gradient-to-r from-pink-500 to-violet-500 text-white rounded-t-lg">
          <div className="flex items-center space-x-3">
            <Sparkles className="h-6 w-6" />
            <div>
              <CardTitle className="text-xl">🚀 Universal AI Workflow Generator</CardTitle>
              <CardDescription className="text-pink-100">
                Describe ANY business process - I'll intelligently create detailed workflows with proper approvals
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Describe your business process (any industry, any scenario):
              </label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Examples - ANY business process works:&#10;&#10;• I need approval for a $150,000 marketing campaign for Q4 launch...&#10;• A customer wants to return a $500 product they bought online...&#10;• An employee is requesting 2 weeks vacation time...&#10;• A vendor wants to register with our company for $50K contract...&#10;• We're hiring a new senior developer with $120K salary...&#10;&#10;Just describe it naturally - I'll figure out the workflow steps, approvals, and create a detailed visual diagram!"
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
                  🧠 Analyzing Process & Generating Workflow...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  🚀 Generate Universal Workflow
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {generatedWorkflow && (
        <>
          {/* Workflow Summary Card */}
          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-indigo-50">
            <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-t-lg">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{generatedWorkflow.name}</CardTitle>
                  <CardDescription className="text-indigo-100">
                    {generatedWorkflow.steps?.length || 0} intelligent steps • Est. {generatedWorkflow.estimated_duration}
                  </CardDescription>
                </div>
                <Badge className="bg-white/20 text-white border-white/30">
                  Universal AI Generated
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="p-6">
              <p className="text-gray-700 text-sm mb-4">{generatedWorkflow.description}</p>
              
              <div className="space-y-3">
                {generatedWorkflow.steps?.map((step: WorkflowStep, index: number) => {
                  const StepIcon = getStepIcon(step.icon);
                  
                  return (
                    <div key={step.id} className="flex items-start space-x-4 p-4 bg-white rounded-lg border shadow-sm">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {index + 1}
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <StepIcon className="h-5 w-5 text-gray-600" />
                          <h4 className="font-medium text-gray-900">{step.name}</h4>
                          <Badge className={getTypeColor(step.type)}>
                            {step.type.replace('_', ' ')}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">{step.description}</p>
                        
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{step.duration}</span>
                          </div>
                          {step.assignee && (
                            <div className="flex items-center space-x-1">
                              <Users className="h-3 w-3" />
                              <span>{step.assignee}</span>
                            </div>
                          )}
                        </div>

                        {step.conditions && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {step.conditions.approved && (
                              <Badge className="bg-green-100 text-green-800 text-xs">
                                ✓ {step.conditions.approved}
                              </Badge>
                            )}
                            {step.conditions.rejected && (
                              <Badge className="bg-red-100 text-red-800 text-xs">
                                ✗ {step.conditions.rejected}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* VISUAL WORKFLOW DIAGRAM */}
          <div className="mt-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <Zap className="h-6 w-6 mr-2 text-purple-600" />
              Visual Workflow Diagram
            </h3>
            <VisualWorkflowDiagram workflow={generatedWorkflow} />
          </div>

          {/* WORKFLOW CHATBOT - FIXED DISPLAY */}
          <div className="mt-8">
            <WorkflowChatbot
              workflow={generatedWorkflow}
              onWorkflowUpdate={setGeneratedWorkflow}
              isMinimized={isChatbotMinimized}
              onToggleMinimize={() => setIsChatbotMinimized(!isChatbotMinimized)}
            />
          </div>
        </>
      )}
    </div>
  );
};
