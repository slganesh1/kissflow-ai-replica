
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Workflow chat function called');

    if (!openAIApiKey) {
      console.error('OPENAI_API_KEY not found');
      return new Response(JSON.stringify({ 
        error: 'OPENAI_API_KEY not configured' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const requestBody = await req.json();
    console.log('Request body:', requestBody);

    const { message, workflow, conversationHistory } = requestBody;

    if (!message || !message.trim()) {
      console.error('Message is required');
      return new Response(JSON.stringify({ 
        error: 'Message is required' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
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

    // Prepare conversation history for ChatGPT
    const messages = [
      { role: 'system', content: systemPrompt },
      ...(conversationHistory || []).map((msg: any) => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      })),
      {
        role: 'user',
        content: message
      }
    ];

    console.log('Calling OpenAI API for workflow chat...');
    console.log('Messages:', messages);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    console.log('OpenAI API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      
      return new Response(JSON.stringify({ 
        error: 'Failed to get AI response', 
        details: `OpenAI API returned ${response.status}: ${errorText}` 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    console.log('OpenAI response received successfully');
    
    if (!data || !data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
      console.error('Invalid response format from OpenAI:', data);
      return new Response(JSON.stringify({ 
        error: 'Invalid response format from AI service' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    const aiResponse = data.choices[0].message.content;

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
