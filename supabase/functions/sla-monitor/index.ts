
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Running SLA monitoring checks...');

    // Update workflow SLA statuses
    const { error: slaUpdateError } = await supabaseClient.rpc('update_workflow_sla_status');
    if (slaUpdateError) {
      console.error('Error updating SLA status:', slaUpdateError);
    } else {
      console.log('SLA status updated successfully');
    }

    // Handle escalations for overdue approvals
    const { error: escalationError } = await supabaseClient.rpc('escalate_overdue_approvals');
    if (escalationError) {
      console.error('Error processing escalations:', escalationError);
    } else {
      console.log('Escalations processed successfully');
    }

    // Send notifications for at-risk and overdue workflows
    await sendSLANotifications(supabaseClient);

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'SLA monitoring completed successfully' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('SLA monitoring error:', error);
    return new Response(JSON.stringify({ 
      error: 'SLA monitoring failed', 
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function sendSLANotifications(supabaseClient: any) {
  try {
    // Get workflows that are at risk or overdue
    const { data: workflows, error } = await supabaseClient
      .from('workflow_executions')
      .select(`
        id,
        workflow_name,
        workflow_type,
        sla_status,
        sla_deadline,
        submitter_name,
        workflow_approvals!inner(approver_role)
      `)
      .in('sla_status', ['at_risk', 'overdue'])
      .eq('status', 'pending');

    if (error) {
      console.error('Error fetching workflows for notifications:', error);
      return;
    }

    for (const workflow of workflows || []) {
      const notificationType = workflow.sla_status === 'at_risk' ? 'reminder' : 'overdue';
      const recipientRole = workflow.workflow_approvals?.[0]?.approver_role || 'manager';
      
      const message = workflow.sla_status === 'at_risk' 
        ? `Workflow "${workflow.workflow_name}" is approaching its SLA deadline. Please review and take action.`
        : `Workflow "${workflow.workflow_name}" has exceeded its SLA deadline and requires immediate attention.`;

      // Insert notification record
      await supabaseClient
        .from('workflow_sla_notifications')
        .insert({
          workflow_id: workflow.id,
          notification_type: notificationType,
          recipient_role: recipientRole,
          message: message
        });
    }

    console.log(`Sent ${workflows?.length || 0} SLA notifications`);
  } catch (error) {
    console.error('Error sending SLA notifications:', error);
  }
}
