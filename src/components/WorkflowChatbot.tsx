import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Send, Bot, User, MessageCircle, Minimize2, Maximize2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

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
      content: `Hi! I'm your AI workflow assistant powered by ChatGPT for "${workflow?.name || 'your workflow'}". I can analyze this workflow's ${workflow?.steps?.length || 0} steps and help you understand the process, timing, responsibilities, and potential optimizations. What would you like to know?`,
      timestamp: new Date(),
      type: 'question'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateAIResponse = async (userMessage: string): Promise<string> => {
    try {
      console.log('Sending message to ChatGPT:', userMessage);
      console.log('Workflow context:', workflow?.name);

      const { data, error } = await supabase.functions.invoke('workflow-chat', {
        body: { 
          message: userMessage,
          workflow: workflow,
          conversationHistory: conversationHistory
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Failed to get AI response');
      }

      if (!data || !data.response) {
        throw new Error('No response received from ChatGPT');
      }

      console.log('ChatGPT response received:', data.response);
      return data.response;
    } catch (error) {
      console.error('Error getting ChatGPT response:', error);
      throw error;
    }
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
    setConversationHistory(prev => [...prev, userMessage]);
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
      setConversationHistory(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error generating ChatGPT response:', error);
      toast.error(`Failed to get ChatGPT response: ${error.message}`);
      
      // Add error message to chat
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please try again or check if the OpenAI API service is properly configured.',
        timestamp: new Date(),
        type: 'question'
      };
      setMessages(prev => [...prev, errorMessage]);
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
              <CardTitle className="text-sm">ChatGPT AI Assistant</CardTitle>
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
                onClick={() => setInputMessage("Explain this workflow in detail")}
              >
                Explain Process
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => setInputMessage("Who is responsible for each step?")}
              >
                Responsibilities
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => setInputMessage("How can this workflow be optimized?")}
              >
                Optimize
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
