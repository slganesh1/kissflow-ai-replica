
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Package, Database, Cog, Shield, Code, Monitor, Palette, Webhook, Table } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { workflowExportService, WorkflowExportOptions } from '@/services/WorkflowExportService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface WorkflowExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workflowId?: string;
}

export const WorkflowExportModal = ({ open, onOpenChange, workflowId }: WorkflowExportModalProps) => {
  const [exportOptions, setExportOptions] = useState<WorkflowExportOptions>({
    includeDatabase: true,
    includeEngine: true,
    includeSLAMonitor: true,
    includeUIComponents: true,
    includeAuth: true,
    includeAPI: true,
    zapierWebhook: 'https://hooks.zapier.com/hooks/catch/23746431/u37rl89/',
    triggerZapierOnExport: true,
    airtableBaseId: '',
    airtableTableName: 'Workflows',
    syncToAirtable: true,
  });
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    let targetWorkflowId = workflowId;
    
    // If no specific workflow ID, get the latest workflow
    if (!targetWorkflowId) {
      try {
        const { data: latestWorkflow, error } = await supabase
          .from('workflow_executions')
          .select('id')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
          
        if (error || !latestWorkflow) {
          toast.error('No workflows found to export');
          return;
        }
        
        targetWorkflowId = latestWorkflow.id;
      } catch (error) {
        toast.error('Failed to fetch latest workflow');
        return;
      }
    }
    
    setIsExporting(true);
    try {
      // Focus on sending to integrations rather than downloading
      await sendWorkflowToIntegrations(targetWorkflowId);
      toast.success('Workflow successfully sent to Zapier and Airtable!');
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to export workflow: ' + (error as Error).message);
    } finally {
      setIsExporting(false);
    }
  };

  const sendWorkflowToIntegrations = async (workflowId: string) => {
    // Get workflow data
    const { data: workflow, error: workflowError } = await supabase
      .from('workflow_executions')
      .select('*')
      .eq('id', workflowId)
      .single();

    if (workflowError) throw new Error('Failed to fetch workflow data');

    // Get workflow approvals
    const { data: approvals } = await supabase
      .from('workflow_approvals')
      .select('*')
      .eq('workflow_id', workflowId);

    const workflowData = {
      workflow,
      approvals: approvals || []
    };

    const manifest = {
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
      components: ['workflow-data', 'approvals'],
      workflowId: workflowId
    };

    // Send to Zapier
    if (exportOptions.triggerZapierOnExport && exportOptions.zapierWebhook) {
      await triggerZapierWebhook(exportOptions.zapierWebhook, workflowData, manifest);
    }

    // Send to Airtable  
    if (exportOptions.syncToAirtable && exportOptions.airtableBaseId && exportOptions.airtableTableName) {
      await syncToAirtable(exportOptions.airtableBaseId, exportOptions.airtableTableName, workflowData, manifest);
    }
  };

  const triggerZapierWebhook = async (webhookUrl: string, workflowData: any, manifest: any) => {
    console.log('🔄 Starting Zapier webhook trigger to:', webhookUrl);
    
    const payload = {
      timestamp: new Date().toISOString(),
      source: 'TechzFlowAI',
      event: 'workflow_exported',
      workflow: {
        id: workflowData.workflow.id,
        name: workflowData.workflow.workflow_name,
        type: workflowData.workflow.workflow_type,
        status: workflowData.workflow.status,
        submitter: workflowData.workflow.submitter_name,
        created_at: workflowData.workflow.created_at,
        request_data: workflowData.workflow.request_data
      },
      export: {
        components: manifest.components,
        version: manifest.version,
        exported_at: manifest.exportedAt
      },
      approvals: workflowData.approvals?.map((approval: any) => ({
        step_name: approval.step_name,
        approver_role: approval.approver_role,
        status: approval.status,
        order_sequence: approval.order_sequence
      })) || []
    };

    console.log('📤 Sending payload to Zapier:', payload);

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'no-cors',
        body: JSON.stringify(payload)
      });

      console.log('✅ Zapier webhook request sent (no-cors mode - cannot verify response)');
      toast.success('Data sent to Zapier webhook!');
    } catch (error) {
      console.error('❌ Failed to send to Zapier:', error);
      toast.error('Failed to send to Zapier: ' + (error as Error).message);
      throw error;
    }
  };

  const syncToAirtable = async (baseId: string, tableName: string, workflowData: any, manifest: any) => {
    console.log('🔄 Starting Airtable sync to base:', baseId, 'table:', tableName);
    
    const payload = {
      baseId,
      tableName,
      record: {
        fields: {
          'Workflow ID': workflowData.workflow.id,
          'Workflow Name': workflowData.workflow.workflow_name,
          'Workflow Type': workflowData.workflow.workflow_type,
          'Status': workflowData.workflow.status,
          'Submitter': workflowData.workflow.submitter_name,
          'Created At': workflowData.workflow.created_at,
          'SLA Status': workflowData.workflow.sla_status,
          'Request Data': JSON.stringify(workflowData.workflow.request_data),
          'Export Version': manifest.version,
          'Exported At': manifest.exportedAt,
          'Components': manifest.components.join(', '),
          'Approvals Count': workflowData.approvals?.length || 0,
          'Approval Status': workflowData.approvals?.map((a: any) => `${a.step_name}: ${a.status}`).join('; ') || 'None'
        }
      }
    };

    console.log('📤 Sending payload to Airtable:', payload);

    try {
      const { data, error } = await supabase.functions.invoke('sync-to-airtable', {
        body: payload
      });

      if (error) {
        console.error('❌ Airtable sync failed:', error);
        toast.error('Failed to sync to Airtable: ' + error.message);
        throw new Error('Airtable sync failed: ' + error.message);
      }
      
      console.log('✅ Successfully synced to Airtable:', data);
      toast.success('Data synced to Airtable successfully!');
    } catch (error) {
      console.error('❌ Airtable sync error:', error);
      toast.error('Airtable sync error: ' + (error as Error).message);
      throw error;
    }
  };

  const handleExportAll = async () => {
    setIsExporting(true);
    try {
      await workflowExportService.exportAllWorkflows(exportOptions);
      toast.success('All workflows exported successfully!');
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to export workflows: ' + (error as Error).message);
    } finally {
      setIsExporting(false);
    }
  };

  const exportComponents = [
    {
      key: 'includeDatabase' as keyof WorkflowExportOptions,
      icon: Database,
      title: 'Database Schema',
      description: 'SQL migrations, tables, and configuration'
    },
    {
      key: 'includeEngine' as keyof WorkflowExportOptions,
      icon: Cog,
      title: 'Workflow Engine',
      description: 'Core workflow processing logic'
    },
    {
      key: 'includeSLAMonitor' as keyof WorkflowExportOptions,
      icon: Monitor,
      title: 'SLA Monitor',
      description: 'Background monitoring and escalation'
    },
    {
      key: 'includeUIComponents' as keyof WorkflowExportOptions,
      icon: Palette,
      title: 'UI Components',
      description: 'Forms, dashboards, and interfaces'
    },
    {
      key: 'includeAuth' as keyof WorkflowExportOptions,
      icon: Shield,
      title: 'Authentication',
      description: 'User management and security'
    },
    {
      key: 'includeAPI' as keyof WorkflowExportOptions,
      icon: Code,
      title: 'API Integration',
      description: 'REST endpoints and webhooks'
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Export Workflow Package</span>
          </DialogTitle>
            <DialogDescription>
              Send latest workflow data to Zapier and Airtable integrations
            </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Export Components</CardTitle>
              <CardDescription>
                Select which components to include in your export package
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {exportComponents.map((component) => (
                  <div key={component.key} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                    <Checkbox
                      id={component.key}
                      checked={exportOptions[component.key] as boolean}
                      onCheckedChange={(checked) => 
                        setExportOptions(prev => ({ ...prev, [component.key]: checked }))
                      }
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <component.icon className="h-4 w-4 text-blue-600" />
                        <Label htmlFor={component.key} className="font-medium cursor-pointer">
                          {component.title}
                        </Label>
                      </div>
                      <p className="text-sm text-gray-600">{component.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Webhook className="h-5 w-5" />
                <span>Zapier Integration</span>
              </CardTitle>
              <CardDescription>
                Automatically trigger your Zapier workflow when exporting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="triggerZapierOnExport"
                  checked={exportOptions.triggerZapierOnExport}
                  onCheckedChange={(checked) => 
                    setExportOptions(prev => ({ ...prev, triggerZapierOnExport: checked as boolean }))
                  }
                />
                <Label htmlFor="triggerZapierOnExport" className="font-medium">
                  Send data to Zapier on export
                </Label>
              </div>
              
              {exportOptions.triggerZapierOnExport && (
                <div>
                  <Label htmlFor="zapierWebhook" className="text-sm font-medium">
                    Zapier Webhook URL
                  </Label>
                  <Input
                    id="zapierWebhook"
                    placeholder="https://hooks.zapier.com/hooks/catch/..."
                    value={exportOptions.zapierWebhook || ''}
                    onChange={(e) => 
                      setExportOptions(prev => ({ ...prev, zapierWebhook: e.target.value }))
                    }
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This will send workflow data to your Zapier webhook to trigger automation
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Table className="h-5 w-5" />
                <span>Airtable Integration</span>
              </CardTitle>
              <CardDescription>
                Automatically sync workflow data to your Airtable base
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="syncToAirtable"
                  checked={exportOptions.syncToAirtable}
                  onCheckedChange={(checked) => 
                    setExportOptions(prev => ({ ...prev, syncToAirtable: checked as boolean }))
                  }
                />
                <Label htmlFor="syncToAirtable" className="font-medium">
                  Sync to Airtable on export
                </Label>
              </div>
              
              {exportOptions.syncToAirtable && (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="airtableBaseId" className="text-sm font-medium">
                      Airtable Base ID
                    </Label>
                    <Input
                      id="airtableBaseId"
                      placeholder="appXXXXXXXXXXXXXX"
                      value={exportOptions.airtableBaseId || ''}
                      onChange={(e) => 
                        setExportOptions(prev => ({ ...prev, airtableBaseId: e.target.value }))
                      }
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Found in your Airtable base URL: airtable.com/appXXXXXX/...
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="airtableTableName" className="text-sm font-medium">
                      Table Name
                    </Label>
                    <Input
                      id="airtableTableName"
                      placeholder="Workflows"
                      value={exportOptions.airtableTableName || ''}
                      onChange={(e) => 
                        setExportOptions(prev => ({ ...prev, airtableTableName: e.target.value }))
                      }
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      The exact name of your Airtable table
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">What's Included</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Complete workflow definition and configuration</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Integration documentation and examples</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>TypeScript definitions and type safety</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Ready-to-deploy code and configurations</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handleExportAll}
              disabled={isExporting}
              className="flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Export All Workflows</span>
            </Button>

            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleExport}
                disabled={isExporting}
                className="flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>{isExporting ? 'Sending...' : (workflowId ? 'Send Workflow' : 'Send Latest Workflow')}</span>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
