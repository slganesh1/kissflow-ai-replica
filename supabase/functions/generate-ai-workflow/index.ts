
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

    const systemPrompt = `You are an expert workflow designer. Create a detailed, intelligent workflow based on the business process description. 

IMPORTANT: Respond with ONLY a JSON object in this exact format:
{
  "name": "Workflow Name (max 60 chars)",
  "description": "Brief description of the workflow",
  "type": "ai-generated",
  "estimated_duration": "X hours/days",
  "steps": [
    {
      "id": "step-1",
      "name": "Step Name",
      "type": "form|approval|review|validation|processing",
      "assignee": "Role/Person responsible",
      "duration": "X minutes/hours/days",
      "description": "What happens in this step",
      "level": 1-7
    }
  ]
}

Guidelines:
- Create 6-12 steps that make logical sense for the process
- Use appropriate step types: form, approval, review, validation, processing
- Assign realistic durations and assignees
- Level 1-3: Initial processing, Level 4-5: Approvals, Level 6-7: Execution/Completion
- Make workflows intelligent and context-aware
- Consider approval hierarchies for financial/critical processes
- Include validation and quality checks where appropriate`;

    console.log('Calling OpenAI API for workflow generation...');

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
          { role: 'user', content: `Create a workflow for: ${businessProcess}` }
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
    
    // Parse the JSON response
    let workflowData;
    try {
      workflowData = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiResponse);
      throw new Error('AI returned invalid JSON format');
    }

    // Add generated timestamp and ID
    workflowData.id = `ai-workflow-${Date.now()}`;
    workflowData.created_at = new Date().toISOString();
    workflowData.status = 'draft';

    console.log('Generated workflow:', workflowData);

    return new Response(JSON.stringify({ workflow: workflowData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-ai-workflow function:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to generate workflow', 
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
