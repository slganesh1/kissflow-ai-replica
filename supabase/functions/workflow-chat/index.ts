
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, workflow, conversationHistory } = await req.json();

    if (!message || !message.trim()) {
      throw new Error('Message is required');
    }

    const systemPrompt = `You are an expert workflow assistant. You help users understand and analyze their specific workflows.

WORKFLOW CONTEXT:
${JSON.stringify(workflow, null, 2)}

Your responsibilities:
1. Answer questions about the specific workflow provided
2. Explain workflow steps, timing, responsibilities, and processes
3. Provide insights about potential issues, bottlenecks, or improvements
4. Give practical advice about workflow execution and optimization
5. Be concise but thorough in your responses

Guidelines:
- Always reference the actual workflow data provided
- Give specific, actionable answers
- Include relevant workflow details (step names, assignees, durations, etc.)
- Use markdown formatting for better readability
- Keep responses focused and practical
- If asked about modifications, explain what changes would mean`;

    // Prepare conversation history for Claude
    const messages = [
      ...(conversationHistory || []).map((msg: any) => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      })),
      {
        role: 'user',
        content: message
      }
    ];

    console.log('Calling Anthropic API for workflow chat...');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${anthropicApiKey}`,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1000,
        system: systemPrompt,
        messages: messages
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Anthropic API error:', errorData);
      throw new Error(`Anthropic API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    console.log('Anthropic response received');
    
    const aiResponse = data.content[0].text;

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in workflow-chat function:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to get AI response', 
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
