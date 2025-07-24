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

    const { eventType, workflowId, stepId, eventData } = await req.json()

    if (!eventType || !workflowId) {
      return new Response(
        JSON.stringify({ error: 'Event type and workflow ID are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Processing workflow event: ${eventType} for workflow: ${workflowId}`)

    // Find event waiting tasks
    const { data: eventTasks, error: findError } = await supabaseClient
      .from('workflow_tasks')
      .select('*')
      .eq('workflow_id', workflowId)
      .eq('task_type', 'event_wait')
      .eq('status', 'pending')

    if (findError) {
      return new Response(
        JSON.stringify({ error: `Failed to find event tasks: ${findError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let matchedTasks = 0
    const matchingTasks = eventTasks?.filter(task => {
      const taskData = task.data as any
      return taskData?.event_type === eventType
    }) || []

    for (const task of matchingTasks) {
      // Complete the event task
      const { error: updateError } = await supabaseClient
        .from('workflow_tasks')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          data: {
            ...task.data,
            event_received: true,
            event_data: eventData,
            triggered_at: new Date().toISOString()
          }
        })
        .eq('id', task.id)

      if (updateError) {
        console.error('Failed to update task:', updateError)
        continue
      }

      // Log the event
      await supabaseClient
        .from('workflow_execution_log')
        .insert({
          workflow_id: workflowId,
          step_id: task.step_id,
          action: 'event_triggered',
          actor: 'system',
          details: {
            event_type: eventType,
            event_data: eventData,
            step_name: (task.data as any)?.step_name
          }
        })

      matchedTasks++
    }

    // Check if workflow can continue
    if (matchedTasks > 0) {
      // Check if all tasks are completed for this workflow
      const { data: pendingTasks, error: pendingError } = await supabaseClient
        .from('workflow_tasks')
        .select('*')
        .eq('workflow_id', workflowId)
        .eq('status', 'pending')

      if (!pendingError && (!pendingTasks || pendingTasks.length === 0)) {
        // Mark workflow as completed
        await supabaseClient
          .from('workflow_executions')
          .update({ 
            status: 'completed',
            sla_status: 'completed',
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
            details: { triggered_by_event: eventType }
          })

        console.log(`Workflow ${workflowId} completed after event trigger`)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Event ${eventType} processed successfully`,
        matchedTasks,
        workflowId
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error processing workflow event:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})