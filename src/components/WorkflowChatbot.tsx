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
    
    const lowerMessage = userMessage.toLowerCase();
    const workflowSteps = workflow?.steps || [];
    const workflowName = workflow?.name || 'Unknown Workflow';
    const estimatedDuration = workflow?.estimated_duration || 'Not specified';
    
    // Get approval steps
    const approvalSteps = workflowSteps.filter((step: any) => step.type === 'approval');
    const reviewSteps = workflowSteps.filter((step: any) => step.type === 'review');
    const validationSteps = workflowSteps.filter((step: any) => step.type === 'validation');
    
    // Workflow explanation
    if (lowerMessage.includes('explain') || lowerMessage.includes('about') || lowerMessage.includes('overview')) {
      const stepBreakdown = workflowSteps.map((step: any, index: number) => 
        `${index + 1}. **${step.name}** (${step.type}) - ${step.duration || 'Variable time'}\n   ${step.description}`
      ).join('\n\n');

      return `**${workflowName} - Complete Workflow Explanation:**

**Overview:**
This workflow has ${workflowSteps.length} sequential steps designed to ensure comprehensive processing and approval.

**Estimated Total Duration:** ${estimatedDuration}

**Step-by-Step Breakdown:**

${stepBreakdown}

**Key Features:**
• ${approvalSteps.length} approval checkpoints
• ${reviewSteps.length} review stages  
• ${validationSteps.length} validation processes
• Automated notifications and tracking

Would you like me to explain any specific step in more detail?`;
    }

    // Approval-related questions
    if (lowerMessage.includes('approval') || lowerMessage.includes('approve')) {
      const approvalDetails = approvalSteps.map((step: any, index: number) => 
        `**${step.name}**\n• Assignee: ${step.assignee || 'Not specified'}\n• Duration: ${step.duration || 'Variable'}\n• Description: ${step.description}`
      ).join('\n\n');

      return `**Approval Process in ${workflowName}:**

This workflow includes ${approvalSteps.length} approval step(s):

${approvalDetails || 'No specific approval steps configured.'}

**Approval Flow:**
${approvalSteps.length > 1 ? 'Multi-level approval system with escalation' : 'Single approval required'}

Each approval step includes conditions for both approval and rejection paths to ensure proper workflow routing.`;
    }

    // Time/duration questions
    if (lowerMessage.includes('time') || lowerMessage.includes('duration') || lowerMessage.includes('long')) {
      const timeBreakdown = workflowSteps.map((step: any, index: number) => 
        `• Step ${index + 1}: ${step.name} - ${step.duration || 'Variable time'}`
      ).join('\n');

      return `**Timing Breakdown for ${workflowName}:**

**Total Estimated Duration:** ${estimatedDuration}

**Individual Step Timings:**
${timeBreakdown}

**Factors Affecting Duration:**
• Complexity of the request
• Approver availability
• Documentation completeness
• Current workload and priorities

The workflow is designed to balance thoroughness with efficiency.`;
    }

    // Responsibility questions
    if (lowerMessage.includes('who') || lowerMessage.includes('responsible') || lowerMessage.includes('assignee')) {
      const responsibilityMap = workflowSteps.map((step: any, index: number) => 
        `**Step ${index + 1}: ${step.name}**\n• Responsible: ${step.assignee || 'System/Automated'}\n• Type: ${step.type}`
      ).join('\n\n');

      return `**Responsibility Matrix for ${workflowName}:**

${responsibilityMap}

**Key Stakeholders:**
${Array.from(new Set(workflowSteps.map((s: any) => s.assignee).filter(Boolean))).map(assignee => `• ${assignee}`).join('\n') || '• Various automated systems and approvers'}

Each role has specific responsibilities and authority levels within the workflow process.`;
    }

    // Step-specific questions
    if (lowerMessage.includes('step')) {
      const stepNumber = lowerMessage.match(/step (\d+)/)?.[1];
      if (stepNumber) {
        const stepIndex = parseInt(stepNumber) - 1;
        const step = workflowSteps[stepIndex];
        if (step) {
          return `**Step ${stepNumber}: ${step.name}**

**Type:** ${step.type}
**Duration:** ${step.duration || 'Variable time'}
**Assignee:** ${step.assignee || 'System/Automated'}

**Description:** ${step.description}

${step.conditions ? `**Conditional Logic:**
• If approved: ${step.conditions.approved}
• If rejected: ${step.conditions.rejected}` : ''}

This step is ${stepIndex === 0 ? 'the first step' : stepIndex === workflowSteps.length - 1 ? 'the final step' : `step ${stepIndex + 1} of ${workflowSteps.length}`} in the workflow process.`;
        }
      }
      
      return `**All Steps in ${workflowName}:**

${workflowSteps.map((step: any, index: number) => 
  `${index + 1}. ${step.name} (${step.type}) - ${step.assignee || 'System'}`
).join('\n')}

Ask about a specific step number for detailed information!`;
    }

    // Status and tracking
    if (lowerMessage.includes('status') || lowerMessage.includes('track')) {
      return `**${workflowName} Status & Tracking:**

**Current Configuration:**
• Total Steps: ${workflowSteps.length}
• Approval Gates: ${approvalSteps.length}
• Review Stages: ${reviewSteps.length}
• Estimated Duration: ${estimatedDuration}

**Workflow Status:** Ready for execution
**Monitoring:** Each step includes tracking and logging capabilities

The workflow provides real-time status updates and maintains an audit trail of all actions and decisions.`;
    }

    // Default response with actual workflow data
    return `I'm here to help with your **${workflowName}** workflow.

**Quick Facts:**
• ${workflowSteps.length} total steps
• ${approvalSteps.length} approval checkpoints
• Estimated duration: ${estimatedDuration}

**What I can help with:**
• **"Explain the workflow"** - Get complete step breakdown
• **"Who is responsible?"** - See all assignees and roles  
• **"How long does it take?"** - Detailed timing information
• **"Tell me about step X"** - Specific step details
• **"What approvals are needed?"** - Approval process details

What specific aspect would you like to explore?`;
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
    <div className="fixed bottom-4 right-4 z-50 w-96 h-[500px]">
      <Card className="h-full flex flex-col shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-t-lg py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bot className="h-5 w-5" />
              <CardTitle className="text-sm">Workflow Assistant</CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-white/20 text-white border-white/30 text-xs">
                {workflow?.workflow_name || workflow?.name || 'Workflow'} 
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
                    className={`max-w-[80%] rounded-lg p-3 ${
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
                  <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
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
                onClick={() => setInputMessage("Why is the executive approval 24 hours?")}
              >
                Executive Time
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => setInputMessage("Who are the approvers for this workflow?")}
              >
                Approvers
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => setInputMessage("What's the current status?")}
              >
                Status
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
