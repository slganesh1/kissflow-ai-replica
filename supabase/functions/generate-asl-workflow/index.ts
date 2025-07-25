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
    const { businessProcess } = await req.json();

    if (!businessProcess || !businessProcess.trim()) {
      throw new Error('Business process description is required');
    }

    const systemPrompt = `You are an expert Amazon States Language (ASL) workflow designer. Create a valid ASL JSON state machine based on the business process description.

IMPORTANT: Respond with ONLY a valid ASL JSON object in this exact format:
{
  "Comment": "Brief description of the workflow",
  "StartAt": "FirstStateName",
  "States": {
    "StateName": {
      "Type": "Task|Pass|Choice|Parallel|Wait|Succeed|Fail",
      "Resource": "arn:aws:states:::service:action",
      "Parameters": {},
      "Next": "NextStateName" | "End": true
    }
  }
}

Guidelines:
- Use appropriate ASL state types: Task, Pass, Choice, Parallel, Wait, Succeed, Fail
- Include realistic Resource ARNs for Task states (e.g., arn:aws:states:::lambda:invoke, arn:aws:states:::sns:publish)
- Add proper Parameters for each state
- Use Next for transitions or End: true for final states
- For approvals, use Task states with approval resources
- For decisions, use Choice states with conditions
- Keep the ASL specification compliant
- Make the workflow logical and executable`;

    console.log('Calling OpenAI API for ASL workflow generation...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Create an ASL workflow for: ${businessProcess}` }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    console.log('OpenAI response received');
    
    const aiResponse = data.choices[0].message.content;
    
    // Parse the JSON response to validate it
    let aslWorkflow;
    try {
      aslWorkflow = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiResponse);
      throw new Error('AI returned invalid ASL JSON format');
    }

    console.log('Generated ASL workflow:', aslWorkflow);

    return new Response(JSON.stringify({ aslWorkflow }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-asl-workflow function:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to generate ASL workflow', 
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});