import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Send, Bot, User, MessageCircle, Minimize2, Maximize2 } from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'modification' | 'question' | 'suggestion';
}

interface WorkflowChatbotProps {
  workflow: any;
  onWorkflowUpdate?: (updatedWorkflow: any) => void;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
}

export const WorkflowChatbot: React.FC<WorkflowChatbotProps> = ({
  workflow,
  onWorkflowUpdate,
  isMinimized = false,
  onToggleMinimize
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hi! I'm your workflow assistant for "${workflow?.name || 'your workflow'}". I can analyze this specific workflow and answer questions about its ${workflow?.steps?.length || 0} steps, approval processes, and execution details. What would you like to know?`,
      timestamp: new Date(),
      type: 'question'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateAIResponse = async (userMessage: string): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (!workflow || !workflow.steps) {
      return "I don't have access to the workflow details right now. Please make sure a workflow is generated first.";
    }

    const lowerMessage = userMessage.toLowerCase();
    const workflowSteps = workflow.steps || [];
    const workflowName = workflow.name || 'AI Generated Workflow';
    const estimatedDuration = workflow.estimated_duration || 'Not specified';
    const workflowDescription = workflow.description || 'No description available';
    
    // Extract unique assignees
    const uniqueAssignees = Array.from(new Set(workflowSteps.map((s: any) => s.assignee)));
    
    console.log('Processing chatbot question:', userMessage);
    console.log('Workflow context:', { 
      workflowName, 
      stepsCount: workflowSteps.length, 
      estimatedDuration,
      description: workflowDescription,
      uniqueAssignees
    });
    
    // Categorize steps by type
    const approvalSteps = workflowSteps.filter((step: any) => 
      step.type === 'approval' || step.name.toLowerCase().includes('approval')
    );
    const reviewSteps = workflowSteps.filter((step: any) => 
      step.type === 'review' || step.name.toLowerCase().includes('review')
    );
    const validationSteps = workflowSteps.filter((step: any) => 
      step.type === 'validation' || step.name.toLowerCase().includes('validation')
    );
    const processingSteps = workflowSteps.filter((step: any) => 
      step.type === 'processing' || step.name.toLowerCase().includes('processing')
    );
    const formSteps = workflowSteps.filter((step: any) => 
      step.type === 'form' || step.name.toLowerCase().includes('form')
    );

    // Why questions - specific workflow timing analysis
    if (lowerMessage.includes('why') && (lowerMessage.includes('day') || lowerMessage.includes('time') || lowerMessage.includes('long'))) {
      const longSteps = workflowSteps.filter((step: any) => {
        const duration = step.duration.toLowerCase();
        return duration.includes('day') && parseInt(duration.match(/\d+/)?.[0] || '0') >= 1;
      });

      if (longSteps.length === 0) {
        return `The workflow "${workflowName}" doesn't have any steps that take a full day or longer. All steps are designed for quick processing:\n\n${workflowSteps.map((step: any, idx: number) => `• Step ${idx + 1}: ${step.name} - ${step.duration}`).join('\n')}`;
      }

      const stepAnalysis = longSteps.map((step: any) => {
        const stepIndex = workflowSteps.indexOf(step) + 1;
        const duration = step.duration;
        let reasoning = '';
        
        if (step.type === 'approval') {
          reasoning = 'Approval processes require time for proper review, stakeholder coordination, and decision-making protocols.';
        } else if (step.type === 'review') {
          reasoning = 'Review steps need adequate time for thorough analysis, quality checks, and compliance verification.';
        } else if (step.name.toLowerCase().includes('legal')) {
          reasoning = 'Legal reviews require extensive analysis of regulations, contracts, and compliance requirements.';
        } else if (step.name.toLowerCase().includes('compliance')) {
          reasoning = 'Compliance checks involve multiple regulatory requirements and detailed documentation review.';
        } else {
          reasoning = 'This step involves complex processes that require adequate time for proper execution.';
        }

        return `**Step ${stepIndex}: ${step.name}** (${duration})\n• **Assignee:** ${step.assignee}\n• **Why it takes time:** ${reasoning}\n• **Impact:** ${step.type === 'approval' ? 'Critical decision point' : 'Quality assurance step'}`;
      }).join('\n\n');

      return `**Why Some Steps Take Longer in "${workflowName}":**\n\n${stepAnalysis}\n\n**Workflow Optimization Tips:**\n• Set clear deadlines for each step\n• Implement parallel processing where possible\n• Use automated notifications for pending tasks\n• Consider escalation procedures for delays\n\n**Overall Timeline:** The ${estimatedDuration} estimate accounts for proper review cycles and decision-making processes to ensure quality outcomes.`;
    }

    // Workflow explanation with actual step details
    if (lowerMessage.includes('explain') || lowerMessage.includes('about') || lowerMessage.includes('overview') || lowerMessage.includes('workflow')) {
      const stepBreakdown = workflowSteps.map((step: any, index: number) => 
        `**${index + 1}. ${step.name}** (${step.type})\n   - **Duration:** ${step.duration}\n   - **Assignee:** ${step.assignee}\n   - **Description:** ${step.description}\n   - **Level:** ${step.level || 'Standard'}`
      ).join('\n\n');

      return `**${workflowName} - Complete Analysis:**\n\n**Overview:**\n${workflowDescription}\n\n**Key Metrics:**\n• **Total Steps:** ${workflowSteps.length}\n• **Estimated Duration:** ${estimatedDuration}\n• **Approval Steps:** ${approvalSteps.length}\n• **Review Steps:** ${reviewSteps.length}\n• **Processing Steps:** ${processingSteps.length}\n• **Validation Steps:** ${validationSteps.length}\n\n**Step-by-Step Breakdown:**\n\n${stepBreakdown}\n\n**Process Flow Summary:**\nThis workflow follows a structured approach with ${formSteps.length} initial form/input steps, ${reviewSteps.length} review stages, ${approvalSteps.length} approval checkpoints, ${validationSteps.length} validation processes, and ${processingSteps.length} processing/execution steps.\n\nWould you like me to explain any specific step in more detail?`;
    }

    // Approval-related questions with specific workflow data
    if (lowerMessage.includes('approval') || lowerMessage.includes('approve') || lowerMessage.includes('who approves')) {
      if (approvalSteps.length === 0) {
        return `**Approval Process in ${workflowName}:**\n\nThis workflow doesn't have explicit approval steps defined as separate stages. However, approval processes may be integrated within other workflow stages like reviews or processing steps.\n\nBased on the workflow structure, approvals are likely handled as part of the review and processing phases rather than as distinct approval gates.`;
      }

      const approvalDetails = approvalSteps.map((step: any, index: number) => 
        `**${step.name}** (Step ${workflowSteps.indexOf(step) + 1})\n• **Assignee:** ${step.assignee}\n• **Duration:** ${step.duration}\n• **Description:** ${step.description}\n• **Level:** ${step.level || 'Not specified'}`
      ).join('\n\n');

      const totalApprovalTime = approvalSteps.reduce((total: number, step: any) => {
        const duration = step.duration.toLowerCase();
        if (duration.includes('hour')) return total + parseInt(duration.match(/\d+/)?.[0] || '0');
        if (duration.includes('day')) return total + (parseInt(duration.match(/\d+/)?.[0] || '0') * 8);
        return total;
      }, 0);

      return `**Approval Process in ${workflowName}:**\n\nThis workflow includes ${approvalSteps.length} approval step(s):\n\n${approvalDetails}\n\n**Approval Hierarchy:**\n${approvalSteps.length > 1 ? 
        'Multi-level approval system with the following sequence:\n' + 
        approvalSteps.map((step: any, idx: number) => `${idx + 1}. ${step.assignee} (${step.name})`).join('\n') :
        `Single approval checkpoint handled by ${approvalSteps[0].assignee}`
      }\n\n**Total Approval Time:** ${totalApprovalTime} hours estimated\n\nEach approval step includes proper routing for both approval and rejection scenarios.`;
    }

    // Time/duration questions with specific calculations
    if (lowerMessage.includes('time') || lowerMessage.includes('duration') || lowerMessage.includes('long') || lowerMessage.includes('how long')) {
      const timeBreakdown = workflowSteps.map((step: any, index: number) => 
        `• **Step ${index + 1} (${step.name}):** ${step.duration}`
      ).join('\n');

      // Calculate total time in hours
      let totalHours = 0;
      workflowSteps.forEach((step: any) => {
        const duration = step.duration.toLowerCase();
        if (duration.includes('minute')) {
          totalHours += parseInt(duration.match(/\d+/)?.[0] || '0') / 60;
        } else if (duration.includes('hour')) {
          totalHours += parseInt(duration.match(/\d+/)?.[0] || '0');
        } else if (duration.includes('day')) {
          totalHours += parseInt(duration.match(/\d+/)?.[0] || '0') * 8;
        }
      });

      const businessDays = Math.ceil(totalHours / 8);

      return `**Timing Analysis for ${workflowName}:**\n\n**Total Estimated Duration:** ${estimatedDuration}\n**Calculated Total Time:** ${totalHours.toFixed(1)} hours (${businessDays} business days)\n\n**Individual Step Timings:**\n${timeBreakdown}\n\n**Time Distribution:**\n• **Form/Input Steps:** ${formSteps.reduce((total: number, step: any) => {
        const dur = step.duration.toLowerCase();
        if (dur.includes('minute')) return total + parseInt(dur.match(/\d+/)?.[0] || '0');
        return total;
      }, 0)} minutes\n• **Review Steps:** ${reviewSteps.reduce((total: number, step: any) => {
        const dur = step.duration.toLowerCase();
        if (dur.includes('hour')) return total + parseInt(dur.match(/\d+/)?.[0] || '0');
        return total;
      }, 0)} hours\n• **Approval Steps:** ${approvalSteps.reduce((total: number, step: any) => {
        const dur = step.duration.toLowerCase();
        if (dur.includes('day')) return total + parseInt(dur.match(/\d+/)?.[0] || '0');
        return total;
      }, 0)} days\n\n**Critical Path:** The longest sequence involves ${approvalSteps.length > 0 ? 'approval processes' : 'processing steps'}, which may cause delays if not managed efficiently.`;
    }

    // Responsibility questions with actual assignee data
    if (lowerMessage.includes('who') || lowerMessage.includes('responsible') || lowerMessage.includes('assignee') || lowerMessage.includes('owner')) {
      const responsibilityMap = workflowSteps.map((step: any, index: number) => 
        `**Step ${index + 1}: ${step.name}**\n• **Responsible:** ${step.assignee}\n• **Type:** ${step.type}\n• **Duration:** ${step.duration}\n• **Level:** ${step.level || 'N/A'}`
      ).join('\n\n');

      const assigneeWorkload = uniqueAssignees.map(assignee => {
        const steps = workflowSteps.filter((s: any) => s.assignee === assignee);
        return `• **${assignee}**: ${steps.length} step(s) - ${steps.map((s: any) => s.name).join(', ')}`;
      }).join('\n');

      return `**Responsibility Matrix for ${workflowName}:**\n\n${responsibilityMap}\n\n**Stakeholder Summary:**\n${assigneeWorkload}\n\n**Role Analysis:**\n• **Manual Steps:** ${workflowSteps.filter((s: any) => s.assignee && s.assignee !== 'System').length}\n• **Automated Steps:** ${workflowSteps.filter((s: any) => s.assignee === 'System').length}\n• **Total Stakeholders:** ${uniqueAssignees.length}\n\n**Key Decision Makers:**\n${approvalSteps.map((step: any) => `• ${step.assignee} (${step.name})`).join('\n') || '• No explicit approval roles defined'}\n\nEach stakeholder has clearly defined responsibilities and authority levels within the process framework.`;
    }

    // Step-specific questions with actual step data
    if (lowerMessage.includes('step')) {
      const stepNumber = lowerMessage.match(/step (\d+)/)?.[1];
      if (stepNumber) {
        const stepIndex = parseInt(stepNumber) - 1;
        const step = workflowSteps[stepIndex];
        if (step) {
          const stepPosition = stepIndex === 0 ? 'the initial step' : stepIndex === workflowSteps.length - 1 ? 'the final step' : `step ${stepIndex + 1} of ${workflowSteps.length}`;
          const prevStep = stepIndex > 0 ? workflowSteps[stepIndex - 1] : null;
          const nextStep = stepIndex < workflowSteps.length - 1 ? workflowSteps[stepIndex + 1] : null;

          return `**Step ${stepNumber}: ${step.name}**\n\n**Details:**\n• **Type:** ${step.type}\n• **Duration:** ${step.duration}\n• **Assignee:** ${step.assignee}\n• **Level:** ${step.level || 'Not specified'}\n\n**Description:** ${step.description}\n\n**Position in Workflow:**\nThis is ${stepPosition} in the workflow sequence.\n\n**Dependencies:**\n${prevStep ? `• **Previous Step:** ${prevStep.name}` : '• **Starting Point:** This is the first step'}\n${nextStep ? `• **Next Step:** ${nextStep.name}` : '• **End Point:** This is the final step'}\n\n**Process Level:** ${
            step.level === 1 ? 'Initial Processing - Data collection and validation' :
            step.level === 2 ? 'Review Stage - Initial assessment and verification' :
            step.level === 3 ? 'Approval Stage - Management decision point' :
            step.level === 4 ? 'Final Approval - Executive decision' :
            step.level === 5 ? 'Implementation - Planning and resource allocation' :
            step.level === 6 ? 'Execution - Active processing and delivery' :
            step.level === 7 ? 'Completion - Final documentation and closure' :
            'Standard Processing Level'
          }`;
        } else {
          return `Step ${stepNumber} doesn't exist in this workflow. This workflow has ${workflowSteps.length} steps total. Please ask about a step between 1 and ${workflowSteps.length}.`;
        }
      }
      
      return `**All Steps in ${workflowName}:**\n\n${workflowSteps.map((step: any, index: number) => 
        `${index + 1}. **${step.name}** (${step.type}) - ${step.assignee} [${step.duration}]`
      ).join('\n')}\n\n**Step Categories:**\n• **Form/Input Steps:** ${formSteps.length} - Initial data collection\n• **Review Steps:** ${reviewSteps.length} - Assessment and verification  \n• **Approval Steps:** ${approvalSteps.length} - Decision checkpoints\n• **Validation Steps:** ${validationSteps.length} - Quality assurance\n• **Processing Steps:** ${processingSteps.length} - Active execution\n\nAsk about a specific step number (e.g., "tell me about step 3") for detailed information!`;
    }

    // Problems or issues with specific workflow analysis
    if (lowerMessage.includes('problem') || lowerMessage.includes('issue') || lowerMessage.includes('bottleneck') || lowerMessage.includes('improve')) {
      const longSteps = workflowSteps.filter((step: any) => {
        const duration = step.duration.toLowerCase();
        return duration.includes('day') && parseInt(duration.match(/\d+/)?.[0] || '0') > 1;
      });

      const assigneeOverload = uniqueAssignees.filter(assignee => 
        workflowSteps.filter((s: any) => s.assignee === assignee).length > 2
      );

      return `**Potential Issues and Improvements for ${workflowName}:**\n\n**Potential Bottlenecks:**\n${longSteps.length > 0 ? 
        longSteps.map((step: any) => `• **${step.name}** (${step.duration}) - Assigned to ${step.assignee}`).join('\n') :
        '• No obvious bottlenecks identified based on duration analysis'
      }\n\n**Resource Constraints:**\n${assigneeOverload.length > 0 ?
        assigneeOverload.map(assignee => `• **${assignee}** handles ${workflowSteps.filter((s: any) => s.assignee === assignee).length} steps - consider load balancing`).join('\n') :
        '• Workload appears well-distributed across stakeholders'
      }\n\n**Optimization Opportunities:**\n• **Parallel Processing:** ${reviewSteps.length > 1 ? 'Some review steps could potentially run in parallel' : 'Consider if any sequential steps can be parallelized'}\n• **Automation:** ${workflowSteps.filter((s: any) => s.assignee !== 'System').length} manual steps could be evaluated for automation\n• **Approval Efficiency:** ${approvalSteps.length > 2 ? 'Consider consolidating some approval levels' : 'Approval process appears streamlined'}\n\n**Risk Assessment:**\n• **Single Points of Failure:** ${assigneeOverload.length} role(s) handle multiple critical steps\n• **Dependencies:** Sequential nature means delays compound through the workflow\n\n**Recommendations:**\n1. Set up automated notifications for time-sensitive steps\n2. Define escalation procedures for delayed approvals  \n3. Consider backup assignees for critical roles\n4. Implement progress tracking and milestone alerts`;
    }

    // Default comprehensive response with actual workflow data
    return `**${workflowName} - Workflow Assistant**\n\nI can provide specific information about your workflow. Here's what I know:\n\n**Workflow Summary:**\n• **Name:** ${workflowName}\n• **Description:** ${workflowDescription}\n• **Total Steps:** ${workflowSteps.length}\n• **Estimated Duration:** ${estimatedDuration}\n• **Approval Points:** ${approvalSteps.length}\n• **Key Stakeholders:** ${uniqueAssignees.join(', ')}\n\n**What You Can Ask:**\n• **"Explain the workflow"** - Complete step-by-step analysis\n• **"Who is responsible for each step?"** - Full responsibility matrix  \n• **"How long does this take?"** - Detailed timing breakdown\n• **"Tell me about step [number]"** - Specific step details\n• **"What approvals are needed?"** - Approval process overview\n• **"What problems might occur?"** - Risk analysis and improvements\n• **"Why does step X take so long?"** - Timing justification\n\n**Quick Facts:**\n• **Complexity Level:** ${workflowSteps.length > 8 ? 'High' : workflowSteps.length > 5 ? 'Medium' : 'Low'} (${workflowSteps.length} steps)\n• **Automation Level:** ${Math.round((workflowSteps.filter((s: any) => s.assignee === 'System').length / workflowSteps.length) * 100)}% automated\n• **Critical Path:** Approval steps may cause delays if not managed properly\n\nAsk me anything specific about this workflow and I'll give you detailed, accurate information!`;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const aiResponse = await generateAIResponse(inputMessage);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
        type: inputMessage.toLowerCase().includes('modify') || inputMessage.toLowerCase().includes('add') ? 'modification' : 'question'
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error generating AI response:', error);
      toast.error('Failed to get AI response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={onToggleMinimize}
          className="rounded-full w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 w-96 h-[500px]">
      <Card className="h-full flex flex-col shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-t-lg py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bot className="h-5 w-5" />
              <CardTitle className="text-sm">Workflow Assistant</CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-white/20 text-white border-white/30 text-xs">
                {workflow?.name?.substring(0, 15) || 'Workflow'}...
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleMinimize}
                className="text-white hover:bg-white/20 h-6 w-6 p-0"
              >
                <Minimize2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      {message.role === 'assistant' && (
                        <Bot className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      )}
                      {message.role === 'user' && (
                        <User className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg p-3 max-w-[85%]">
                    <div className="flex items-center space-x-2">
                      <Bot className="h-4 w-4" />
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-75"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div ref={messagesEndRef} />
          </ScrollArea>

          <div className="border-t p-4">
            <div className="flex space-x-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Ask about your workflow..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button
                onClick={async () => {
                  if (!inputMessage.trim()) return;

                  const userMessage: Message = {
                    id: Date.now().toString(),
                    role: 'user',
                    content: inputMessage,
                    timestamp: new Date()
                  };

                  setMessages(prev => [...prev, userMessage]);
                  setInputMessage('');
                  setIsLoading(true);

                  try {
                    const aiResponse = await generateAIResponse(inputMessage);
                    
                    const assistantMessage: Message = {
                      id: (Date.now() + 1).toString(),
                      role: 'assistant',
                      content: aiResponse,
                      timestamp: new Date(),
                      type: inputMessage.toLowerCase().includes('modify') || inputMessage.toLowerCase().includes('add') ? 'modification' : 'question'
                    };

                    setMessages(prev => [...prev, assistantMessage]);
                  } catch (error) {
                    console.error('Error generating AI response:', error);
                    toast.error('Failed to get AI response. Please try again.');
                  } finally {
                    setIsLoading(false);
                  }
                }}
                disabled={!inputMessage.trim() || isLoading}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => setInputMessage("Explain the workflow")}
              >
                Explain Process
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => setInputMessage("Who is responsible?")}
              >
                Responsibilities
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => setInputMessage("How long does this take?")}
              >
                Timing
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
