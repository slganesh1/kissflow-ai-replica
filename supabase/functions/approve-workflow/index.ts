
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const { workflowId, stepId, decision, comments, approverId } = await req.json()

    if (!workflowId || !stepId || !decision || !approverId) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Processing approval: ${stepId}, decision: ${decision}`)

    // Find the approval record
    const { data: approval, error: findError } = await supabaseClient
      .from('workflow_approvals')
      .select('*')
      .eq('workflow_id', workflowId)
      .eq('step_id', stepId)
      .eq('status', 'pending')
      .single()

    if (findError || !approval) {
      return new Response(
        JSON.stringify({ error: 'Approval record not found or already processed' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Update approval record
    const { error: updateError } = await supabaseClient
      .from('workflow_approvals')
      .update({
        status: decision,
        approver_id: approverId,
        approved_at: new Date().toISOString(),
        rejection_reason: decision === 'rejected' ? comments : null
      })
      .eq('id', approval.id)

    if (updateError) {
      return new Response(
        JSON.stringify({ error: `Failed to update approval: ${updateError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Update corresponding task
    await supabaseClient
      .from('workflow_tasks')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('workflow_id', workflowId)
      .eq('step_id', stepId)

    // Log the event
    await supabaseClient
      .from('workflow_execution_log')
      .insert({
        workflow_id: workflowId,
        step_id: stepId,
        action: `approval_${decision}`,
        actor: approverId,
        details: { comments, step_name: approval.step_name }
      })

    // Check if workflow is complete
    const { data: pendingApprovals, error: pendingError } = await supabaseClient
      .from('workflow_approvals')
      .select('*')
      .eq('workflow_id', workflowId)
      .eq('status', 'pending')

    if (!pendingError && (!pendingApprovals || pendingApprovals.length === 0)) {
      // Mark workflow as completed
      await supabaseClient
        .from('workflow_executions')
        .update({ 
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', workflowId)

      // Log completion
      await supabaseClient
        .from('workflow_execution_log')
        .insert({
          workflow_id: workflowId,
          step_id: null,
          action: 'workflow_completed',
          actor: 'system',
          details: {}
        })

      console.log(`Workflow ${workflowId} completed successfully`)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Workflow ${decision} successfully`,
        workflowCompleted: !pendingError && (!pendingApprovals || pendingApprovals.length === 0)
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error processing approval:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
