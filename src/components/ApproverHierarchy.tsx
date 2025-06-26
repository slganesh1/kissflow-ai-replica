import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Users, Settings, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

interface ApprovalLevel {
  id: string;
  role: string;
  title: string;
  order: number;
}

interface WorkflowHierarchy {
  id: string;
  workflowType: string;
  name: string;
  levels: ApprovalLevel[];
}

const defaultHierarchies: WorkflowHierarchy[] = [
  {
    id: '1',
    workflowType: 'hr_approval',
    name: 'HR Approval Process',
    levels: [
      { id: '1', role: 'hr', title: 'HR Representative', order: 1 },
      { id: '2', role: 'hr_manager', title: 'HR Manager', order: 2 },
      { id: '3', role: 'ceo', title: 'CEO', order: 3 }
    ]
  },
  {
    id: '2',
    workflowType: 'expense_approval',
    name: 'Expense Approval Process',
    levels: [
      { id: '1', role: 'manager', title: 'Direct Manager', order: 1 },
      { id: '2', role: 'finance_director', title: 'Finance Director', order: 2 }
    ]
  },
  {
    id: '3',
    workflowType: 'marketing_approval',
    name: 'Marketing Campaign Approval',
    levels: [
      { id: '1', role: 'marketing_manager', title: 'Marketing Manager', order: 1 },
      { id: '2', role: 'cmo', title: 'Chief Marketing Officer', order: 2 },
      { id: '3', role: 'finance_director', title: 'Finance Director', order: 3 }
    ]
  }
];

export const ApproverHierarchy = () => {
  const [hierarchies, setHierarchies] = useState<WorkflowHierarchy[]>(defaultHierarchies);
  const [editingHierarchy, setEditingHierarchy] = useState<WorkflowHierarchy | null>(null);
  const [newWorkflowType, setNewWorkflowType] = useState('');
  const [newWorkflowName, setNewWorkflowName] = useState('');

  const addNewHierarchy = () => {
    if (!newWorkflowType || !newWorkflowName) {
      toast.error('Please enter workflow type and name');
      return;
    }

    const newHierarchy: WorkflowHierarchy = {
      id: Date.now().toString(),
      workflowType: newWorkflowType.toLowerCase().replace(/\s+/g, '_'),
      name: newWorkflowName,
      levels: []
    };

    setHierarchies([...hierarchies, newHierarchy]);
    setEditingHierarchy(newHierarchy);
    setNewWorkflowType('');
    setNewWorkflowName('');
    toast.success('New workflow hierarchy created');
  };

  const addApprovalLevel = (hierarchyId: string) => {
    const hierarchy = hierarchies.find(h => h.id === hierarchyId);
    if (!hierarchy) return;

    const newLevel: ApprovalLevel = {
      id: Date.now().toString(),
      role: '',
      title: '',
      order: hierarchy.levels.length + 1
    };

    const updatedHierarchies = hierarchies.map(h => 
      h.id === hierarchyId 
        ? { ...h, levels: [...h.levels, newLevel] }
        : h
    );

    setHierarchies(updatedHierarchies);
  };

  const updateApprovalLevel = (hierarchyId: string, levelId: string, field: string, value: string) => {
    const updatedHierarchies = hierarchies.map(h => 
      h.id === hierarchyId
        ? {
            ...h,
            levels: h.levels.map(l => 
              l.id === levelId ? { ...l, [field]: value } : l
            )
          }
        : h
    );

    setHierarchies(updatedHierarchies);
  };

  const removeApprovalLevel = (hierarchyId: string, levelId: string) => {
    const updatedHierarchies = hierarchies.map(h => 
      h.id === hierarchyId
        ? {
            ...h,
            levels: h.levels.filter(l => l.id !== levelId).map((l, index) => ({ ...l, order: index + 1 }))
          }
        : h
    );

    setHierarchies(updatedHierarchies);
    toast.success('Approval level removed');
  };

  const removeHierarchy = (hierarchyId: string) => {
    setHierarchies(hierarchies.filter(h => h.id !== hierarchyId));
    if (editingHierarchy?.id === hierarchyId) {
      setEditingHierarchy(null);
    }
    toast.success('Workflow hierarchy removed');
  };

  const saveHierarchies = () => {
    // Store in localStorage for demo purposes
    localStorage.setItem('approver_hierarchies', JSON.stringify(hierarchies));
    toast.success('Approver hierarchies saved successfully!');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">Approver Hierarchy Configuration</h3>
          <p className="text-gray-600">Define approval chains for different workflow types</p>
        </div>
        <Button onClick={saveHierarchies} className="bg-green-600 hover:bg-green-700">
          <Settings className="h-4 w-4 mr-2" />
          Save Configuration
        </Button>
      </div>

      {/* Add New Hierarchy */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add New Workflow Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="workflow-type">Workflow Type</Label>
              <Input
                id="workflow-type"
                value={newWorkflowType}
                onChange={(e) => setNewWorkflowType(e.target.value)}
                placeholder="e.g., Purchase Order"
              />
            </div>
            <div>
              <Label htmlFor="workflow-name">Display Name</Label>
              <Input
                id="workflow-name"
                value={newWorkflowName}
                onChange={(e) => setNewWorkflowName(e.target.value)}
                placeholder="e.g., Purchase Order Approval"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={addNewHierarchy} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Workflow Type
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Existing Hierarchies */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {hierarchies.map((hierarchy) => (
          <Card key={hierarchy.id} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{hierarchy.name}</CardTitle>
                  <CardDescription>Type: {hierarchy.workflowType}</CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingHierarchy(hierarchy)}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeHierarchy(hierarchy.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-2 mb-4">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Approval Chain ({hierarchy.levels.length} levels)</span>
                </div>
                
                {hierarchy.levels.length > 0 ? (
                  <div className="flex flex-wrap items-center gap-2">
                    {hierarchy.levels
                      .sort((a, b) => a.order - b.order)
                      .map((level, index) => (
                        <React.Fragment key={level.id}>
                          <Badge variant="secondary" className="px-3 py-1">
                            {level.order}. {level.title || level.role}
                          </Badge>
                          {index < hierarchy.levels.length - 1 && (
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                          )}
                        </React.Fragment>
                      ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No approval levels defined</p>
                )}
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => addApprovalLevel(hierarchy.id)}
                  className="w-full mt-3"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Approval Level
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Hierarchy Modal */}
      {editingHierarchy && (
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Edit: {editingHierarchy.name}</CardTitle>
              <Button
                variant="outline"
                onClick={() => setEditingHierarchy(null)}
              >
                Done
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {editingHierarchy.levels
                .sort((a, b) => a.order - b.order)
                .map((level) => (
                  <div key={level.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">{level.order}</span>
                    </div>
                    
                    <div className="flex-1 grid grid-cols-2 gap-3">
                      <Input
                        placeholder="Role (e.g., hr_manager)"
                        value={level.role}
                        onChange={(e) => updateApprovalLevel(editingHierarchy.id, level.id, 'role', e.target.value)}
                      />
                      <Input
                        placeholder="Title (e.g., HR Manager)"
                        value={level.title}
                        onChange={(e) => updateApprovalLevel(editingHierarchy.id, level.id, 'title', e.target.value)}
                      />
                    </div>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeApprovalLevel(editingHierarchy.id, level.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
