
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
      return new Response(
        JSON.stringify({ error: `Failed to fetch workflow: ${workflowError?.message}` }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get workflow template
    const { data: template, error: templateError } = await supabaseClient
      .from('workflow_templates')
      .select('*')
      .eq('type', workflow.workflow_type)
      .eq('active', true)
      .single()

    if (templateError || !template) {
      return new Response(
        JSON.stringify({ error: `No template found for workflow type: ${workflow.workflow_type}` }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Update workflow status to in_progress
    await supabaseClient
      .from('workflow_executions')
      .update({ 
        status: 'in_progress',
        updated_at: new Date().toISOString()
      })
      .eq('id', workflowId)

    // Process workflow steps
    const steps = template.definition.steps
    
    for (const step of steps) {
      console.log(`Processing step: ${step.id}`)
      
      // Check step conditions
      if (!evaluateStepConditions(step, workflow.request_data)) {
        console.log(`Step ${step.id} conditions not met, skipping`)
        continue
      }

      // Create approval task if it's an approval step
      if (step.type === 'approval') {
        // Create approval record
        const approvalData = {
          workflow_id: workflowId,
          step_id: step.id,
          step_name: step.name,
          approver_role: step.role || 'manager',
          status: 'pending',
          order_sequence: 1,
          assigned_at: new Date().toISOString()
        }

        await supabaseClient
          .from('workflow_approvals')
          .insert(approvalData)

        // Create task record
        const taskData = {
          workflow_id: workflowId,
          step_id: step.id,
          task_type: 'approval',
          assigned_role: step.role || 'manager',
          status: 'pending',
          priority: 1,
          data: {
            step_name: step.name,
            workflow_name: workflow.workflow_name,
            request_data: workflow.request_data
          }
        }

        await supabaseClient
          .from('workflow_tasks')
          .insert(taskData)

        // Log event
        await supabaseClient
          .from('workflow_execution_log')
          .insert({
            workflow_id: workflowId,
            step_id: step.id,
            action: 'approval_task_created',
            actor: 'system',
            details: { approver_role: step.role, step_name: step.name }
          })
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Workflow execution started',
        workflowId 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error executing workflow:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function evaluateStepConditions(step: any, requestData: any): boolean {
  if (!step.conditions || step.conditions.length === 0) {
    return true
  }

  return step.conditions.every((condition: any) => {
    const fieldValue = requestData[condition.field]
    const conditionValue = condition.value

    switch (condition.operator) {
      case '>':
        return Number(fieldValue) > Number(conditionValue)
      case '<':
        return Number(fieldValue) < Number(conditionValue)
      case '>=':
        return Number(fieldValue) >= Number(conditionValue)
      case '<=':
        return Number(fieldValue) <= Number(conditionValue)
      case '==':
      case '=':
        return fieldValue == conditionValue
      case '!=':
        return fieldValue != conditionValue
      default:
        return true
    }
  })
}
