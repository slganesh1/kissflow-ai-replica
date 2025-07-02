
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
      content: `Hi! I'm your workflow assistant for "${workflow?.workflow_name || workflow?.name || 'your workflow'}". I can analyze your specific workflow, answer questions about approval times, responsibilities, and suggest improvements based on your actual process. What would you like to know?`,
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

  const analyzeWorkflowData = () => {
    // Extract workflow details for context-aware responses
    const workflowData = {
      name: workflow?.workflow_name || workflow?.name || 'Unknown',
      type: workflow?.workflow_type || workflow?.type || 'Unknown',
      status: workflow?.status || 'Unknown',
      requestData: workflow?.request_data || {},
      steps: workflow?.steps || [],
      approvals: workflow?.approvals || [],
      createdAt: workflow?.created_at,
      submitter: workflow?.submitter_name
    };

    // Get approval information
    const approvalSteps = workflowData.approvals.length > 0 ? workflowData.approvals : 
      (workflowData.steps.filter((step: any) => step.type === 'approval') || []);

    return {
      ...workflowData,
      approvalSteps,
      totalApprovals: approvalSteps.length,
      executiveApproval: approvalSteps.find((step: any) => 
        step.approver_role?.toLowerCase().includes('executive') || 
        step.approver_role?.toLowerCase().includes('ceo') ||
        step.step_name?.toLowerCase().includes('executive')
      )
    };
  };

  const generateAIResponse = async (userMessage: string): Promise<string> => {
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const lowerMessage = userMessage.toLowerCase();
    const workflowAnalysis = analyzeWorkflowData();
    
    // Context-aware responses about executive approval
    if (lowerMessage.includes('executive') && (lowerMessage.includes('24') || lowerMessage.includes('hour') || lowerMessage.includes('time'))) {
      if (workflowAnalysis.executiveApproval) {
        return `Based on your ${workflowAnalysis.name} workflow, the executive approval step has a 24-hour timeframe for several important reasons:

**Business Justification:**
• **Strategic Review**: Executive decisions require comprehensive analysis of business impact
• **Risk Assessment**: Higher-level approvals need time for thorough risk evaluation
• **Stakeholder Consultation**: Executives often need to consult with other departments
• **Due Diligence**: Complex approvals require careful consideration of compliance and policy

**Your Workflow Context:**
• Workflow Type: ${workflowAnalysis.type}
• Current Status: ${workflowAnalysis.status}
• Amount: ${workflowAnalysis.requestData.amount ? '$' + workflowAnalysis.requestData.amount : 'Not specified'}

**Optimization Options:**
• For amounts under $5,000: Consider delegating to department heads
• For urgent requests: Add escalation rules for same-day approval
• For routine expenses: Create pre-approved categories

Would you like me to suggest ways to optimize this approval time for your specific use case?`;
      } else {
        return `I don't see an executive approval step in your current ${workflowAnalysis.name} workflow. Your workflow has ${workflowAnalysis.totalApprovals} approval step(s):

${workflowAnalysis.approvalSteps.map((step: any, index: number) => 
  `• ${step.step_name || `Step ${index + 1}`}: ${step.approver_role || 'Unassigned role'}`
).join('\n')}

If you need to add an executive approval step with specific timing, I can help you modify the workflow structure.`;
      }
    }

    // Workflow-specific timing questions
    if (lowerMessage.includes('how long') || lowerMessage.includes('duration') || lowerMessage.includes('time')) {
      const approvalDetails = workflowAnalysis.approvalSteps.map((step: any, index: number) => {
        const stepName = step.step_name || `Step ${index + 1}`;
        const role = step.approver_role || 'Unassigned';
        const estimatedTime = step.deadline ? 
          `${Math.ceil((new Date(step.deadline).getTime() - Date.now()) / (1000 * 60 * 60))} hours` : 
          'Variable time based on complexity';
        return `• ${stepName} (${role}): ${estimatedTime}`;
      }).join('\n');

      return `Here's the timing breakdown for your ${workflowAnalysis.name} workflow:

**Approval Timeline:**
${approvalDetails || '• No specific approval steps configured'}

**Current Status:** ${workflowAnalysis.status}
**Submitted:** ${workflowAnalysis.createdAt ? new Date(workflowAnalysis.createdAt).toLocaleDateString() : 'Unknown'}
**Submitted by:** ${workflowAnalysis.submitter || 'Unknown'}

**Factors Affecting Processing Time:**
• Request complexity and amount
• Approver availability
• Documentation completeness
• Peak processing periods

Would you like me to suggest ways to optimize the processing time?`;
    }

    // Who is responsible questions
    if (lowerMessage.includes('who') || lowerMessage.includes('responsible') || lowerMessage.includes('approver')) {
      const responsibilityMap = workflowAnalysis.approvalSteps.map((step: any, index: number) => {
        return `**${step.step_name || `Step ${index + 1}`}**
   • Role: ${step.approver_role || 'Unassigned'}
   • Status: ${step.status || 'Pending'}
   • Assigned: ${step.assigned_at ? new Date(step.assigned_at).toLocaleDateString() : 'Not yet assigned'}`;
      }).join('\n\n');

      return `Here are the responsible parties for your ${workflowAnalysis.name} workflow:

${responsibilityMap || 'No specific approvers assigned yet.'}

**Workflow Details:**
• Type: ${workflowAnalysis.type}
• Current Status: ${workflowAnalysis.status}
• Total Approval Steps: ${workflowAnalysis.totalApprovals}

Need to reassign any roles or add additional approvers? I can help modify the workflow structure.`;
    }

    // Cost and budget questions
    if (lowerMessage.includes('cost') || lowerMessage.includes('budget') || lowerMessage.includes('amount')) {
      const amount = workflowAnalysis.requestData.amount;
      const category = workflowAnalysis.requestData.category || workflowAnalysis.requestData.business_purpose;
      
      return `Here's the financial information for your ${workflowAnalysis.name} workflow:

**Request Details:**
• Amount: ${amount ? '$' + amount.toLocaleString() : 'Not specified'}
• Category: ${category || 'Not specified'}
• Purpose: ${workflowAnalysis.requestData.business_purpose || workflowAnalysis.requestData.description || 'Not specified'}

**Approval Thresholds in Your Workflow:**
${workflowAnalysis.approvalSteps.map((step: any) => 
  `• ${step.step_name}: ${step.approver_role} (handles amounts in this range)`
).join('\n') || '• No specific thresholds configured'}

**Cost Optimization Suggestions:**
• Pre-approved vendor lists can streamline processing
• Bulk purchasing agreements for recurring expenses
• Automated approval for amounts under $1,000

Would you like me to analyze the cost-efficiency of your current approval process?`;
    }

    // General workflow questions
    if (lowerMessage.includes('status') || lowerMessage.includes('progress')) {
      return `**Current Status of ${workflowAnalysis.name}:**

Status: **${workflowAnalysis.status.toUpperCase()}**
Created: ${workflowAnalysis.createdAt ? new Date(workflowAnalysis.createdAt).toLocaleDateString() : 'Unknown'}
Submitter: ${workflowAnalysis.submitter || 'Unknown'}

**Progress Details:**
${workflowAnalysis.approvalSteps.map((step: any, index: number) => {
  const stepStatus = step.status || 'pending';
  const icon = stepStatus === 'approved' ? '✅' : stepStatus === 'rejected' ? '❌' : '⏳';
  return `${icon} ${step.step_name || `Step ${index + 1}`} - ${stepStatus}`;
}).join('\n') || '• No approval steps configured'}

Need help moving this workflow forward or addressing any bottlenecks?`;
    }

    // Default context-aware response
    return `I can help you with your ${workflowAnalysis.name} workflow. Here's what I know about it:

**Workflow Overview:**
• Name: ${workflowAnalysis.name}
• Type: ${workflowAnalysis.type}
• Status: ${workflowAnalysis.status}
• Approval Steps: ${workflowAnalysis.totalApprovals}

**What I can help with:**
• **Specific Questions**: Ask about approval times, responsibilities, or status
• **Process Optimization**: Suggest improvements based on your workflow data
• **Modifications**: Add, remove, or modify steps
• **Troubleshooting**: Help resolve bottlenecks or issues

What specific aspect of your workflow would you like to explore?`;
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
