
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
      description: workflowDescription
    });
    
    // Categorize steps
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

    // Workflow explanation
    if (lowerMessage.includes('explain') || lowerMessage.includes('about') || lowerMessage.includes('overview') || lowerMessage.includes('workflow')) {
      const stepBreakdown = workflowSteps.map((step: any, index: number) => 
        `${index + 1}. **${step.name}** (${step.type})\n   - Duration: ${step.duration}\n   - Assignee: ${step.assignee}\n   - Description: ${step.description}`
      ).join('\n\n');

      return `**${workflowName} - Complete Analysis:**

**Overview:**
${workflowDescription}

**Key Metrics:**
• Total Steps: ${workflowSteps.length}
• Estimated Duration: ${estimatedDuration}
• Approval Steps: ${approvalSteps.length}
• Review Steps: ${reviewSteps.length}
• Processing Steps: ${processingSteps.length}

**Step-by-Step Breakdown:**

${stepBreakdown}

**Process Flow Summary:**
This workflow follows a structured approach with ${formSteps.length} initial form/input steps, ${reviewSteps.length} review stages, ${approvalSteps.length} approval checkpoints, ${validationSteps.length} validation processes, and ${processingSteps.length} processing/execution steps.

Would you like me to explain any specific step in more detail?`;
    }

    // Approval-related questions
    if (lowerMessage.includes('approval') || lowerMessage.includes('approve') || lowerMessage.includes('who approves')) {
      if (approvalSteps.length === 0) {
        return `**Approval Process in ${workflowName}:**

This workflow doesn't have explicit approval steps defined as separate stages. However, approval processes may be integrated within other workflow stages like reviews or processing steps.

Based on the workflow structure, approvals are likely handled as part of the review and processing phases rather than as distinct approval gates.`;
      }

      const approvalDetails = approvalSteps.map((step: any, index: number) => 
        `**${step.name}** (Step ${workflowSteps.indexOf(step) + 1})\n• Assignee: ${step.assignee}\n• Duration: ${step.duration}\n• Description: ${step.description}\n• Level: ${step.level || 'Not specified'}`
      ).join('\n\n');

      return `**Approval Process in ${workflowName}:**

This workflow includes ${approvalSteps.length} approval step(s):

${approvalDetails}

**Approval Hierarchy:**
${approvalSteps.length > 1 ? 
  'Multi-level approval system with the following sequence:\n' + 
  approvalSteps.map((step: any, idx: number) => `${idx + 1}. ${step.assignee} (${step.name})`).join('\n') :
  `Single approval checkpoint handled by ${approvalSteps[0].assignee}`
}

**Total Approval Time:** ${approvalSteps.reduce((total: number, step: any) => {
  const duration = step.duration.toLowerCase();
  if (duration.includes('hour')) return total + parseInt(duration.match(/\d+/)?.[0] || '0');
  if (duration.includes('day')) return total + (parseInt(duration.match(/\d+/)?.[0] || '0') * 8);
  return total;
}, 0)} hours estimated

Each approval step includes proper routing for both approval and rejection scenarios.`;
    }

    // Time/duration questions
    if (lowerMessage.includes('time') || lowerMessage.includes('duration') || lowerMessage.includes('long') || lowerMessage.includes('how long')) {
      const timeBreakdown = workflowSteps.map((step: any, index: number) => 
        `• Step ${index + 1} (${step.name}): ${step.duration}`
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

      return `**Timing Analysis for ${workflowName}:**

**Total Estimated Duration:** ${estimatedDuration}
**Calculated Total Time:** ${totalHours} hours (${Math.round(totalHours/8)} business days)

**Individual Step Timings:**
${timeBreakdown}

**Time Distribution:**
• Form/Input Steps: ${formSteps.reduce((total: number, step: any) => {
  const dur = step.duration.toLowerCase();
  if (dur.includes('minute')) return total + parseInt(dur.match(/\d+/)?.[0] || '0');
  return total;
}, 0)} minutes
• Review Steps: ${reviewSteps.reduce((total: number, step: any) => {
  const dur = step.duration.toLowerCase();
  if (dur.includes('hour')) return total + parseInt(dur.match(/\d+/)?.[0] || '0');
  return total;
}, 0)} hours
• Approval Steps: ${approvalSteps.reduce((total: number, step: any) => {
  const dur = step.duration.toLowerCase();
  if (dur.includes('day')) return total + parseInt(dur.match(/\d+/)?.[0] || '0');
  return total;
}, 0)} days

**Critical Path:** The longest sequence involves ${approvalSteps.length > 0 ? 'approval processes' : 'processing steps'}, which may cause delays if not managed efficiently.`;
    }

    // Responsibility questions
    if (lowerMessage.includes('who') || lowerMessage.includes('responsible') || lowerMessage.includes('assignee') || lowerMessage.includes('owner')) {
      const responsibilityMap = workflowSteps.map((step: any, index: number) => 
        `**Step ${index + 1}: ${step.name}**\n• Responsible: ${step.assignee}\n• Type: ${step.type}\n• Duration: ${step.duration}\n• Level: ${step.level || 'N/A'}`
      ).join('\n\n');

      const assigneeWorkload = uniqueAssignees.map(assignee => {
        const steps = workflowSteps.filter((s: any) => s.assignee === assignee);
        return `• **${assignee}**: ${steps.length} step(s) - ${steps.map((s: any) => s.name).join(', ')}`;
      }).join('\n');

      return `**Responsibility Matrix for ${workflowName}:**

${responsibilityMap}

**Stakeholder Summary:**
${assigneeWorkload}

**Role Analysis:**
• **Manual Steps:** ${workflowSteps.filter((s: any) => s.assignee && s.assignee !== 'System').length}
• **Automated Steps:** ${workflowSteps.filter((s: any) => s.assignee === 'System').length}
• **Total Stakeholders:** ${uniqueAssignees.length}

**Key Decision Makers:**
${approvalSteps.map((step: any) => `• ${step.assignee} (${step.name})`).join('\n') || '• No explicit approval roles defined'}

Each stakeholder has clearly defined responsibilities and authority levels within the process framework.`;
    }

    // Step-specific questions
    if (lowerMessage.includes('step')) {
      const stepNumber = lowerMessage.match(/step (\d+)/)?.[1];
      if (stepNumber) {
        const stepIndex = parseInt(stepNumber) - 1;
        const step = workflowSteps[stepIndex];
        if (step) {
          return `**Step ${stepNumber}: ${step.name}**

**Details:**
• **Type:** ${step.type}
• **Duration:** ${step.duration}
• **Assignee:** ${step.assignee}
• **Level:** ${step.level || 'Not specified'}

**Description:** ${step.description}

**Position in Workflow:**
This is ${stepIndex === 0 ? 'the initial step' : stepIndex === workflowSteps.length - 1 ? 'the final step' : `step ${stepIndex + 1} of ${workflowSteps.length}`} in the workflow sequence.

**Dependencies:**
${stepIndex > 0 ? `• **Previous Step:** ${workflowSteps[stepIndex - 1].name}` : '• **Starting Point:** This is the first step'}
${stepIndex < workflowSteps.length - 1 ? `• **Next Step:** ${workflowSteps[stepIndex + 1].name}` : '• **End Point:** This is the final step'}

**Process Level:** ${
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
      
      return `**All Steps in ${workflowName}:**

${workflowSteps.map((step: any, index: number) => 
  `${index + 1}. **${step.name}** (${step.type}) - ${step.assignee} [${step.duration}]`
).join('\n')}

**Step Categories:**
• **Form/Input Steps:** ${formSteps.length} - Initial data collection
• **Review Steps:** ${reviewSteps.length} - Assessment and verification  
• **Approval Steps:** ${approvalSteps.length} - Decision checkpoints
• **Validation Steps:** ${validationSteps.length} - Quality assurance
• **Processing Steps:** ${processingSteps.length} - Active execution

Ask about a specific step number (e.g., "tell me about step 3") for detailed information!`;
    }

    // Problems or issues
    if (lowerMessage.includes('problem') || lowerMessage.includes('issue') || lowerMessage.includes('bottleneck') || lowerMessage.includes('improve')) {
      const longSteps = workflowSteps.filter((step: any) => {
        const duration = step.duration.toLowerCase();
        return duration.includes('day') && parseInt(duration.match(/\d+/)?.[0] || '0') > 1;
      });

      return `**Potential Issues and Improvements for ${workflowName}:**

**Potential Bottlenecks:**
${longSteps.length > 0 ? 
  longSteps.map((step: any) => `• **${step.name}** (${step.duration}) - Assigned to ${step.assignee}`).join('\n') :
  '• No obvious bottlenecks identified based on duration analysis'
}

**Optimization Opportunities:**
• **Parallel Processing:** ${reviewSteps.length > 1 ? 'Some review steps could potentially run in parallel' : 'Consider if any sequential steps can be parallelized'}
• **Automation:** ${workflowSteps.filter((s: any) => s.assignee !== 'System').length} manual steps could be evaluated for automation
• **Approval Efficiency:** ${approvalSteps.length > 2 ? 'Consider consolidating some approval levels' : 'Approval process appears streamlined'}

**Risk Assessment:**
• **Single Points of Failure:** ${uniqueAssignees.filter(assignee => workflowSteps.filter((s: any) => s.assignee === assignee).length > 2).length} role(s) handle multiple critical steps
• **Dependencies:** Sequential nature means delays compound through the workflow

**Recommendations:**
1. Set up automated notifications for time-sensitive steps
2. Define escalation procedures for delayed approvals  
3. Consider backup assignees for critical roles
4. Implement progress tracking and milestone alerts`;
    }

    // Default comprehensive response for unclear questions
    return `**${workflowName} - Workflow Assistant**

I can provide specific information about your workflow. Here's what I know:

**Workflow Summary:**
• **Name:** ${workflowName}
• **Description:** ${workflowDescription}
• **Total Steps:** ${workflowSteps.length}
• **Estimated Duration:** ${estimatedDuration}
• **Approval Points:** ${approvalSteps.length}

**What You Can Ask:**
• **"Explain the workflow"** - Complete step-by-step analysis
• **"Who is responsible for each step?"** - Full responsibility matrix  
• **"How long does this take?"** - Detailed timing breakdown
• **"Tell me about step [number]"** - Specific step details
• **"What approvals are needed?"** - Approval process overview
• **"What problems might occur?"** - Risk analysis and improvements

**Quick Facts:**
• **Complexity Level:** ${workflowSteps.length > 8 ? 'High' : workflowSteps.length > 5 ? 'Medium' : 'Low'} (${workflowSteps.length} steps)
• **Automation Level:** ${Math.round((workflowSteps.filter((s: any) => s.assignee === 'System').length / workflowSteps.length) * 100)}% automated
• **Key Stakeholders:** ${uniqueAssignees.length} different roles involved

Ask me anything specific about this workflow and I'll give you detailed, accurate information!`;
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
                onKeyPress={handleKeyPress}
                placeholder="Ask about your workflow..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
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
