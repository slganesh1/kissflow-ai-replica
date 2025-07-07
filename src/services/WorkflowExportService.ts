
import { supabase } from '@/integrations/supabase/client';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export interface WorkflowExportOptions {
  includeDatabase?: boolean;
  includeEngine?: boolean;
  includeSLAMonitor?: boolean;
  includeUIComponents?: boolean;
  includeAuth?: boolean;
  includeAPI?: boolean;
  workflowTypes?: string[];
}

export class WorkflowExportService {
  async exportWorkflow(workflowId: string, options: WorkflowExportOptions = {}) {
    const zip = new JSZip();
    
    // Get workflow data
    const workflowData = await this.getWorkflowData(workflowId);
    
    // Create export manifest
    const manifest = {
      exportedAt: new Date().toISOString(),
      workflowId,
      options,
      version: '1.0.0',
      components: []
    };

    // Export workflow definition
    zip.file('workflow.json', JSON.stringify(workflowData, null, 2));
    manifest.components.push('workflow-definition');

    // Export database schema if requested
    if (options.includeDatabase) {
      await this.addDatabaseExport(zip, workflowData.workflow.workflow_type);
      manifest.components.push('database-schema');
    }

    // Export workflow engine if requested
    if (options.includeEngine) {
      await this.addEngineExport(zip);
      manifest.components.push('workflow-engine');
    }

    // Export SLA monitor if requested
    if (options.includeSLAMonitor) {
      await this.addSLAMonitorExport(zip);
      manifest.components.push('sla-monitor');
    }

    // Export UI components if requested
    if (options.includeUIComponents) {
      await this.addUIComponentsExport(zip);
      manifest.components.push('ui-components');
    }

    // Export auth system if requested
    if (options.includeAuth) {
      await this.addAuthExport(zip);
      manifest.components.push('authentication');
    }

    // Export API layer if requested
    if (options.includeAPI) {
      await this.addAPIExport(zip);
      manifest.components.push('api-integration');
    }

    // Add documentation
    await this.addDocumentation(zip, manifest);

    // Add manifest
    zip.file('manifest.json', JSON.stringify(manifest, null, 2));

    // Generate and download zip
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, `techzflow-workflow-${workflowId}-export.zip`);

    return manifest;
  }

  private async getWorkflowData(workflowId: string) {
    // Get workflow execution data
    const { data: workflow, error: workflowError } = await supabase
      .from('workflow_executions')
      .select('*')
      .eq('id', workflowId)
      .single();

    if (workflowError) throw workflowError;

    // Get workflow template
    const { data: template } = await supabase
      .from('workflow_templates')
      .select('*')
      .eq('type', workflow.workflow_type)
      .eq('active', true)
      .single();

    // Get SLA config
    const { data: slaConfig } = await supabase
      .from('workflow_sla_config')
      .select('*')
      .eq('workflow_type', workflow.workflow_type);

    // Get approvals structure
    const { data: approvals } = await supabase
      .from('workflow_approvals')
      .select('*')
      .eq('workflow_id', workflowId)
      .order('order_sequence');

    return {
      workflow,
      template,
      slaConfig,
      approvals,
      exportMetadata: {
        exportedAt: new Date().toISOString(),
        version: '1.0.0'
      }
    };
  }

  private async addDatabaseExport(zip: JSZip, workflowType: string) {
    const dbFolder = zip.folder('database');
    
    // SQL migration files
    const migrations = `
-- TechzFlowAI Workflow Database Schema
-- Generated: ${new Date().toISOString()}

-- Workflow executions table
CREATE TABLE IF NOT EXISTS workflow_executions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_name TEXT NOT NULL,
  workflow_type TEXT NOT NULL,
  submitter_name TEXT NOT NULL,
  request_data JSONB NOT NULL,
  status TEXT DEFAULT 'pending',
  sla_deadline TIMESTAMP WITH TIME ZONE,
  sla_status TEXT DEFAULT 'on_time',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Workflow approvals table
CREATE TABLE IF NOT EXISTS workflow_approvals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_id UUID REFERENCES workflow_executions(id),
  step_id TEXT NOT NULL,
  step_name TEXT NOT NULL,
  approver_role TEXT NOT NULL,
  approver_id TEXT,
  status TEXT DEFAULT 'pending',
  order_sequence INTEGER NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE,
  approved_at TIMESTAMP WITH TIME ZONE,
  deadline TIMESTAMP WITH TIME ZONE,
  escalated BOOLEAN DEFAULT false,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- SLA configuration table
CREATE TABLE IF NOT EXISTS workflow_sla_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_type TEXT NOT NULL,
  step_type TEXT NOT NULL,
  sla_hours INTEGER NOT NULL DEFAULT 24,
  escalation_hours INTEGER NOT NULL DEFAULT 48,
  auto_approve_on_expire BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_sla_config ENABLE ROW LEVEL SECURITY;
`;

    dbFolder?.file('001_initial_schema.sql', migrations);
    
    // Insert default SLA config
    const slaDefaults = `
-- Default SLA configurations
INSERT INTO workflow_sla_config (workflow_type, step_type, sla_hours, escalation_hours) VALUES
('${workflowType}', 'approval', 24, 48),
('${workflowType}', 'review', 12, 24),
('${workflowType}', 'processing', 8, 16);
`;
    
    dbFolder?.file('002_default_data.sql', slaDefaults);
  }

  private async addEngineExport(zip: JSZip) {
    const engineFolder = zip.folder('engine');
    
    // Workflow engine code
    const engineCode = `
// TechzFlowAI Workflow Engine
// Generated: ${new Date().toISOString()}

export class WorkflowEngine {
  async executeWorkflow(workflowData: any) {
    // Workflow execution logic
    console.log('Executing workflow:', workflowData.workflow_name);
    
    // Create workflow execution record
    const execution = await this.createExecution(workflowData);
    
    // Process approval steps
    await this.processApprovalSteps(execution);
    
    return execution;
  }

  private async createExecution(workflowData: any) {
    // Implementation for creating workflow execution
    return {
      id: crypto.randomUUID(),
      ...workflowData,
      status: 'pending',
      created_at: new Date().toISOString()
    };
  }

  private async processApprovalSteps(execution: any) {
    // Implementation for processing approval steps
    console.log('Processing approval steps for:', execution.id);
  }
}
`;
    
    engineFolder?.file('WorkflowEngine.ts', engineCode);
  }

  private async addSLAMonitorExport(zip: JSZip) {
    const monitorFolder = zip.folder('monitoring');
    
    const monitorCode = `
// SLA Monitor Function
// Generated: ${new Date().toISOString()}

export async function slaMonitor() {
  console.log('Running SLA monitoring checks...');
  
  // Check for at-risk workflows
  await updateAtRiskWorkflows();
  
  // Check for overdue workflows
  await updateOverdueWorkflows();
  
  // Process escalations
  await processEscalations();
}

async function updateAtRiskWorkflows() {
  // Implementation for updating at-risk workflows
}

async function updateOverdueWorkflows() {
  // Implementation for updating overdue workflows
}

async function processEscalations() {
  // Implementation for processing escalations
}
`;
    
    monitorFolder?.file('sla-monitor.ts', monitorCode);
  }

  private async addUIComponentsExport(zip: JSZip) {
    const uiFolder = zip.folder('components');
    
    const formComponent = `
// Workflow Input Form Component
// Generated: ${new Date().toISOString()}

import React, { useState } from 'react';

export const WorkflowInputForm = () => {
  const [formData, setFormData] = useState({});
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
};
`;
    
    uiFolder?.file('WorkflowInputForm.tsx', formComponent);
  }

  private async addAuthExport(zip: JSZip) {
    const authFolder = zip.folder('auth');
    
    const authConfig = `
// Authentication Configuration
// Generated: ${new Date().toISOString()}

export const authConfig = {
  providers: ['email', 'google'],
  redirectTo: \`\${window.location.origin}/auth/callback\`,
  autoRefreshToken: true,
  persistSession: true
};

export const roleHierarchy = {
  manager: ['user'],
  senior_manager: ['manager', 'user'],
  director: ['senior_manager', 'manager', 'user'],
  vp: ['director', 'senior_manager', 'manager', 'user']
};
`;
    
    authFolder?.file('config.ts', authConfig);
  }

  private async addAPIExport(zip: JSZip) {
    const apiFolder = zip.folder('api');
    
    const apiEndpoints = `
// API Endpoints
// Generated: ${new Date().toISOString()}

export const apiEndpoints = {
  workflows: {
    create: 'POST /api/workflows',
    get: 'GET /api/workflows/:id',
    list: 'GET /api/workflows',
    update: 'PUT /api/workflows/:id',
    delete: 'DELETE /api/workflows/:id'
  },
  approvals: {
    approve: 'POST /api/approvals/:id/approve',
    reject: 'POST /api/approvals/:id/reject',
    list: 'GET /api/approvals'
  }
};
`;
    
    apiFolder?.file('endpoints.ts', apiEndpoints);
  }

  private async addDocumentation(zip: JSZip, manifest: any) {
    const docsFolder = zip.folder('documentation');
    
    const integrationGuide = `
# TechzFlowAI Integration Guide

## Overview
This export contains a complete workflow system exported from TechzFlowAI.

## Components Included
${manifest.components.map((comp: string) => `- ${comp}`).join('\n')}

## Installation
1. Extract the ZIP file
2. Run database migrations (if included)
3. Install dependencies: \`npm install\`
4. Configure environment variables
5. Import components into your application

## Usage
\`\`\`typescript
import { WorkflowEngine } from './engine/WorkflowEngine';
import { WorkflowInputForm } from './components/WorkflowInputForm';

const engine = new WorkflowEngine();
// Use the exported components
\`\`\`

## Support
For support and questions, refer to TechzFlowAI documentation.
`;
    
    docsFolder?.file('integration-guide.md', integrationGuide);
  }

  async exportAllWorkflows(options: WorkflowExportOptions = {}) {
    const { data: workflows } = await supabase
      .from('workflow_executions')
      .select('id, workflow_name, workflow_type')
      .limit(10);

    if (!workflows?.length) {
      throw new Error('No workflows found to export');
    }

    const zip = new JSZip();
    
    for (const workflow of workflows) {
      const workflowZip = new JSZip();
      await this.addWorkflowToZip(workflowZip, workflow.id, options);
      const workflowBlob = await workflowZip.generateAsync({ type: 'blob' });
      zip.file(`${workflow.workflow_type}-${workflow.id}.zip`, workflowBlob);
    }

    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, `techzflow-all-workflows-export.zip`);
  }

  private async addWorkflowToZip(zip: JSZip, workflowId: string, options: WorkflowExportOptions) {
    const workflowData = await this.getWorkflowData(workflowId);
    zip.file('workflow.json', JSON.stringify(workflowData, null, 2));
  }
}

export const workflowExportService = new WorkflowExportService();
