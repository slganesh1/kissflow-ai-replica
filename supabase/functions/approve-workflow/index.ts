
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ApprovalRequest {
  workflowId: string;
  stepId: string;
  decision: 'approved' | 'rejected';
  comments?: string;
  approverId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { workflowId, stepId, decision, comments, approverId }: ApprovalRequest = await req.json();

    console.log('Processing approval:', { workflowId, stepId, decision, approverId });

    // Update the approval record with correct column names
    const { data: approval, error: updateError } = await supabase
      .from('workflow_approvals')
      .update({
        status: decision,
        approver_id: approverId,
        approved_at: new Date().toISOString(),
        rejection_reason: decision === 'rejected' ? comments || null : null
      })
      .eq('workflow_id', workflowId)
      .eq('step_id', stepId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating approval:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update approval' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Only update workflow status, don't mark as completed automatically
    if (decision === 'approved') {
      const { error: workflowError } = await supabase
        .from('workflow_executions')
        .update({
          status: 'in_progress',
          updated_at: new Date().toISOString()
        })
        .eq('id', workflowId);

      if (workflowError) {
        console.error('Error updating workflow:', workflowError);
      }
    } else {
      // Workflow rejected
      const { error: workflowError } = await supabase
        .from('workflow_executions')
        .update({
          status: 'failed',
          updated_at: new Date().toISOString()
        })
        .eq('id', workflowId);

      if (workflowError) {
        console.error('Error updating workflow:', workflowError);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        approval,
        message: `Workflow ${decision} successfully` 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in approve-workflow function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
};

serve(handler);
