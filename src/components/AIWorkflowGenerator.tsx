import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Bot, Clock, CheckCircle, AlertCircle, Users, FileText, Shield, Calculator, CreditCard, Building, Search, Zap, Eye, Send, Mail, UserCheck, ClipboardCheck, Phone, Star, Award, TrendingUp, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

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

  // Universal step analysis - intelligently detects patterns from ANY description
  const analyzeWorkflowFromDescription = (description: string): WorkflowStep[] => {
    const steps: WorkflowStep[] = [];
    let stepCounter = 1;
    
    // Normalize text for analysis
    const text = description.toLowerCase();
    const sentences = description.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.split(/\s+/);

    console.log('Analyzing workflow description:', description);
    console.log('Detected sentences:', sentences.length);
    console.log('Key words found:', words.slice(0, 20));

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

    // 1. UNIVERSAL INPUT DETECTION - Any process starts with some form of input
    if (words.some(w => ['apply', 'application', 'applying', 'submit', 'request', 'asking', 'need', 'want'].includes(w))) {
      const inputVerbs = words.filter(w => ['apply', 'submit', 'request', 'register', 'book', 'schedule', 'order'].includes(w));
      const inputAction = inputVerbs[0] || 'submit';
      
      steps.push(createStep(
        `${inputAction.charAt(0).toUpperCase() + inputAction.slice(1)} Request`,
        'form',
        'User provides initial information and submits their request',
        '5-15 minutes',
        'FileText'
      ));
    }

    // 2. DOCUMENT/INFORMATION VERIFICATION - Universal for most processes
    if (words.some(w => ['document', 'documents', 'information', 'details', 'proof', 'evidence', 'certificate', 'verify', 'check'].includes(w))) {
      steps.push(createStep(
        'Information Verification',
        'verification',
        'Verify submitted information and documents for completeness and authenticity',
        '10-30 minutes',
        'Shield'
      ));
    }

    // 3. ELIGIBILITY/CRITERIA CHECKING - Universal validation
    if (words.some(w => ['eligible', 'eligibility', 'qualify', 'criteria', 'requirements', 'policy', 'rules', 'standards'].includes(w))) {
      steps.push(createStep(
        'Eligibility Assessment',
        'automated_check',
        'System checks if request meets predefined criteria and requirements',
        '5-15 minutes',
        'CheckCircle'
      ));
    }

    // 4. RISK/COMPLIANCE ANALYSIS - Universal for business processes
    if (words.some(w => ['risk', 'compliance', 'regulation', 'policy', 'legal', 'audit', 'security', 'safety'].includes(w))) {
      steps.push(createStep(
        'Risk & Compliance Review',
        'ai_analysis',
        'Automated analysis of risk factors and compliance requirements',
        '15-45 minutes',
        'AlertCircle'
      ));
    }

    // 5. INITIAL REVIEW - Universal first-level human review
    if (sentences.length > 2 || words.length > 20) { // Complex processes need review
      steps.push(createStep(
        'Initial Review',
        'review',
        'Comprehensive review of the request and supporting information',
        '1-4 hours',
        'Eye'
      ));
    }

    // 6. INTELLIGENT APPROVAL DETECTION - Detects approval hierarchy from context
    const approvalIndicators = words.filter(w => 
      ['approve', 'approval', 'manager', 'supervisor', 'boss', 'director', 'committee', 'board', 'senior', 'executive', 'authorize', 'sign'].includes(w)
    );

    if (approvalIndicators.length > 0 || sentences.length > 3) {
      // Determine approval levels based on complexity and keywords
      const hasHighValue = words.some(w => ['high', 'large', 'significant', 'major', 'important', 'critical'].includes(w));
      const hasCommittee = words.some(w => ['committee', 'board', 'group', 'team', 'panel'].includes(w));
      const hasSenior = words.some(w => ['senior', 'executive', 'director', 'vp', 'ceo', 'head'].includes(w));
      
      // Add appropriate approval levels
      if (words.some(w => ['manager', 'supervisor', 'lead'].includes(w)) || !hasHighValue) {
        steps.push(createStep(
          'Manager Approval',
          'approval',
          'Manager reviews and makes approval decision',
          '4-24 hours',
          'Users',
          'Manager'
        ));
      }
      
      if (hasCommittee) {
        steps.push(createStep(
          'Committee Review',
          'approval',
          'Committee evaluates and makes collective decision',
          '2-5 days',
          'Users',
          'Committee'
        ));
      }
      
      if (hasSenior || hasHighValue) {
        steps.push(createStep(
          'Senior Leadership Approval',
          'approval',
          'Senior management final approval for high-value or critical requests',
          '3-7 days',
          'Award',
          'Senior Management'
        ));
      }
    }

    // 7. ASSESSMENT/TESTING - For processes requiring evaluation
    if (words.some(w => ['test', 'assessment', 'evaluation', 'interview', 'exam', 'check', 'inspect', 'review'].includes(w))) {
      const assessmentType = words.find(w => ['interview', 'test', 'exam', 'inspection'].includes(w)) || 'assessment';
      
      steps.push(createStep(
        `${assessmentType.charAt(0).toUpperCase() + assessmentType.slice(1)} Process`,
        'assessment',
        `Conduct ${assessmentType} to evaluate suitability and requirements`,
        '30 minutes - 2 hours',
        'ClipboardCheck'
      ));
    }

    // 8. PROCESSING/EXECUTION - Universal action step
    if (words.some(w => ['process', 'execute', 'implement', 'setup', 'create', 'generate', 'prepare', 'issue', 'provide'].includes(w))) {
      const actionWords = words.filter(w => ['setup', 'create', 'generate', 'issue', 'prepare', 'process'].includes(w));
      const action = actionWords[0] || 'process';
      
      steps.push(createStep(
        `${action.charAt(0).toUpperCase() + action.slice(1)} Implementation`,
        'processing',
        'Execute the approved request and complete necessary setup or processing',
        '30 minutes - 4 hours',
        'Zap'
      ));
    }

    // 9. NOTIFICATION/COMMUNICATION - Universal completion step
    steps.push(createStep(
      'Final Communication',
      'notification',
      'Notify relevant parties of the outcome and provide next steps',
      '5-15 minutes',
      'Mail'
    ));

    // 10. FOLLOW-UP/MONITORING - For ongoing processes
    if (words.some(w => ['monitor', 'track', 'follow', 'ongoing', 'continuous', 'regular', 'periodic'].includes(w))) {
      steps.push(createStep(
        'Ongoing Monitoring',
        'automated_check',
        'Continuous monitoring and periodic review of the implemented solution',
        'Ongoing',
        'TrendingUp'
      ));
    }

    console.log(`Generated ${steps.length} workflow steps`);
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
                placeholder="Examples - ANY business process works:&#10;&#10;• A customer wants to return a product they bought online...&#10;• An employee is requesting time off for vacation...&#10;• A patient needs to schedule surgery with multiple doctors...&#10;• A student is applying for financial aid at university...&#10;• A vendor wants to register with our company...&#10;• A restaurant is opening a new location requiring permits...&#10;• A freelancer is invoicing a client for completed work...&#10;&#10;Just describe it naturally - I'll figure out the workflow steps, approvals, and create a detailed visual diagram!"
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
            <div className="space-y-4">
              <p className="text-gray-700 text-sm">{generatedWorkflow.description}</p>
              
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
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
