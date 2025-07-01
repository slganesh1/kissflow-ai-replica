
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
      content: `Hi! I'm your workflow assistant. I can help you modify your "${workflow?.name || 'workflow'}", answer questions about the process, or suggest improvements. What would you like to know?`,
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
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const lowerMessage = userMessage.toLowerCase();
    
    // Workflow modification requests
    if (lowerMessage.includes('add step') || lowerMessage.includes('new step')) {
      return `I can help you add a new step to your workflow. Based on your request, I suggest adding a step after step ${Math.floor(Math.random() * workflow.steps.length) + 1}. Would you like me to:

1. Add an approval step
2. Add a notification step  
3. Add a validation step
4. Add a custom step

Please specify which type of step you'd like to add and where in the process.`;
    }
    
    if (lowerMessage.includes('remove') || lowerMessage.includes('delete')) {
      return `I can help you remove steps from your workflow. Currently, your workflow has ${workflow.steps.length} steps. Which step would you like to remove? Please specify either the step number or describe the step you want to remove.`;
    }
    
    if (lowerMessage.includes('modify') || lowerMessage.includes('change') || lowerMessage.includes('update')) {
      return `I can help you modify your workflow. Here are some common modifications I can assist with:

• Change approval levels or thresholds
• Update step descriptions or requirements
• Modify timeframes and deadlines
• Change assigned roles or departments
• Update notification settings

What specific aspect would you like to modify?`;
    }
    
    // Workflow questions
    if (lowerMessage.includes('how long') || lowerMessage.includes('duration') || lowerMessage.includes('time')) {
      const totalTime = workflow.steps.reduce((total: number, step: any) => {
        const timeMatch = step.estimatedTime?.match(/(\d+)/);
        return total + (timeMatch ? parseInt(timeMatch[1]) : 0);
      }, 0);
      return `Based on your current workflow, the estimated total processing time is approximately ${totalTime} hours. This includes:

${workflow.steps.map((step: any, index: number) => 
  `• Step ${index + 1}: ${step.name} - ${step.estimatedTime || 'Variable time'}`
).join('\n')}

Keep in mind that parallel processing and actual processing times may vary.`;
    }
    
    if (lowerMessage.includes('who') || lowerMessage.includes('responsible') || lowerMessage.includes('approver')) {
      const approvers = workflow.steps
        .filter((step: any) => step.type === 'approval')
        .map((step: any) => step.approver_role || 'Not specified');
      
      return `Here are the key people involved in your workflow:

${workflow.steps.map((step: any, index: number) => 
  `• Step ${index + 1}: ${step.name} - ${step.approver_role || step.description.includes('AI') ? 'AI System' : 'System/User'}`
).join('\n')}

Would you like me to help you reassign any of these roles or add additional approvers?`;
    }
    
    if (lowerMessage.includes('cost') || lowerMessage.includes('budget') || lowerMessage.includes('expense')) {
      return `I can help you understand the cost implications of your workflow:

• Resource costs: Time spent by each department/role
• System costs: AI processing, notifications, integrations
• Delay costs: Potential impact of bottlenecks

Your workflow involves ${new Set(workflow.steps.map((s: any) => s.approver_role)).size} different roles/departments. Would you like me to help optimize the workflow to reduce costs or processing time?`;
    }
    
    // General workflow analysis
    if (lowerMessage.includes('optimize') || lowerMessage.includes('improve') || lowerMessage.includes('better')) {
      return `Based on my analysis of your workflow, here are some optimization suggestions:

🔄 **Parallel Processing**: Steps 2-4 could potentially run in parallel
⏱️ **Time Optimization**: Consider automating manual review steps
🤖 **AI Enhancement**: Add AI pre-screening to reduce manual effort
📊 **Bottleneck Prevention**: Add escalation rules for stuck approvals

Would you like me to implement any of these optimizations?`;
    }
    
    // Default helpful response
    return `I understand you're asking about "${userMessage}". I can help you with:

• **Workflow Modifications**: Add, remove, or modify steps
• **Process Questions**: Understand timing, responsibilities, requirements
• **Optimization**: Improve efficiency and reduce bottlenecks
• **Compliance**: Ensure regulatory and policy adherence
• **Integration**: Connect with other systems or workflows

Could you be more specific about what aspect of the workflow you'd like to focus on?`;
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
                {workflow?.name || 'Workflow'} 
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
                onClick={() => setInputMessage("How can I optimize this workflow?")}
              >
                Optimize
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => setInputMessage("Add an approval step")}
              >
                Add Step
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => setInputMessage("Who are the approvers?")}
              >
                Approvers
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
