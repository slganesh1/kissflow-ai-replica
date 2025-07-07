
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Package, Database, Cog, Shield, Code, Monitor, Palette } from 'lucide-react';
import { workflowExportService, WorkflowExportOptions } from '@/services/WorkflowExportService';
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
    includeAPI: true
  });
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!workflowId) {
      toast.error('No workflow selected for export');
      return;
    }

    setIsExporting(true);
    try {
      const manifest = await workflowExportService.exportWorkflow(workflowId, exportOptions);
      toast.success(`Workflow exported successfully! Included ${manifest.components.length} components.`);
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to export workflow: ' + (error as Error).message);
    } finally {
      setIsExporting(false);
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
            Create a complete, portable workflow package for integration with other applications
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
                disabled={isExporting || !workflowId}
                className="flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>{isExporting ? 'Exporting...' : 'Export Workflow'}</span>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
