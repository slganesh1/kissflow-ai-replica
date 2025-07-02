
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

    const { workflowId } = await req.json()

    if (!workflowId) {
      return new Response(
        JSON.stringify({ error: 'Workflow ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Executing workflow: ${workflowId}`)

    // Get workflow details
    const { data: workflow, error: workflowError } = await supabaseClient
      .from('workflow_executions')
      .select('*')
      .eq('id', workflowId)
      .single()

    if (workflowError || !workflow) {
      console.error('Workflow fetch error:', workflowError)
      return new Response(
        JSON.stringify({ error: `Failed to fetch workflow: ${workflowError?.message}` }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Found workflow:', workflow)

    // Update workflow status to in_progress
    const { error: updateError } = await supabaseClient
      .from('workflow_executions')
      .update({ 
        status: 'in_progress',
        updated_at: new Date().toISOString()
      })
      .eq('id', workflowId)

    if (updateError) {
      console.error('Update error:', updateError)
      return new Response(
        JSON.stringify({ error: `Failed to update workflow status: ${updateError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Process workflow steps from request_data
    const steps = workflow.request_data?.steps || []
    
    console.log('Processing steps:', steps.length)
    
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i]
      console.log(`Processing step ${i + 1}: ${step.name}`)
      
      // Create approval task if it's an approval step
      if (step.type === 'approval' || step.name.toLowerCase().includes('approval')) {
        // Create approval record
        const approvalData = {
          workflow_id: workflowId,
          step_id: step.id,
          step_name: step.name,
          approver_role: step.assignee || 'manager',
          status: 'pending',
          order_sequence: i + 1,
          assigned_at: new Date().toISOString()
        }

        const { error: approvalError } = await supabaseClient
          .from('workflow_approvals')
          .insert(approvalData)

        if (approvalError) {
          console.error('Approval insert error:', approvalError)
        } else {
          console.log('Created approval task for step:', step.name)
        }

        // Create task record
        const taskData = {
          workflow_id: workflowId,
          step_id: step.id,
          task_type: 'approval',
          assigned_role: step.assignee || 'manager',
          status: 'pending',
          priority: 1,
          data: {
            step_name: step.name,
            workflow_name: workflow.workflow_name,
            request_data: workflow.request_data,
            description: step.description,
            duration: step.duration
          }
        }

        const { error: taskError } = await supabaseClient
          .from('workflow_tasks')
          .insert(taskData)

        if (taskError) {
          console.error('Task insert error:', taskError)
        }

        // Log event
        const { error: logError } = await supabaseClient
          .from('workflow_execution_log')
          .insert({
            workflow_id: workflowId,
            step_id: step.id,
            action: 'approval_task_created',
            actor: 'system',
            details: { 
              approver_role: step.assignee, 
              step_name: step.name,
              step_number: i + 1
            }
          })

        if (logError) {
          console.error('Log insert error:', logError)
        }
      }
    }

    console.log('Workflow execution completed successfully')

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Workflow execution started successfully',
        workflowId,
        stepsProcessed: steps.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error executing workflow:', error)
    return new Response(
      JSON.stringify({ 
        error: `Workflow execution failed: ${error.message}`,
        details: error.stack
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
