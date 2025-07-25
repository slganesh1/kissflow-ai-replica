import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { workflowEngine } from '@/services/WorkflowEngine';
import { aslParser, type ASLStateMachine } from '@/services/ASLParser';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Clock, Play, FileText, Code, Wand2 } from 'lucide-react';

export function ASLWorkflowDemo() {
  const [aslDefinition, setAslDefinition] = useState(`{
  "Comment": "Simple approval workflow example",
  "StartAt": "RequestApproval",
  "States": {
    "RequestApproval": {
      "Type": "Task",
      "Resource": "arn:aws:states:::approval",
      "Parameters": {
        "approver": "manager",
        "message": "Please approve this request"
      },
      "Next": "SendNotification"
    },
    "SendNotification": {
      "Type": "Pass",
      "Parameters": {
        "message": "Request has been processed"
      },
      "End": true
    }
  }
}`);
  const [businessProcess, setBusinessProcess] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [validationResult, setValidationResult] = useState<{ valid: boolean; errors: string[] } | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<string>('');

  // Example ASL definitions
  const exampleDefinitions = {
    simple: {
      name: "Simple Approval Workflow",
      definition: {
        Comment: "A simple workflow with approval and notification",
        StartAt: "RequestApproval",
        States: {
          "RequestApproval": {
            Type: "Task",
            Resource: "arn:aws:states:::approval",
            Parameters: {
              "approver": "manager",
              "message": "Please approve this request"
            },
            Next: "SendNotification"
          },
          "SendNotification": {
            Type: "Pass",
            Parameters: {
              "message": "Request has been processed"
            },
            End: true
          }
        }
      }
    },
    conditional: {
      name: "Conditional Workflow",
      definition: {
        Comment: "Workflow with conditional branching",
        StartAt: "EvaluateAmount",
        States: {
          "EvaluateAmount": {
            Type: "Choice",
            Choices: [
              {
                Variable: "$.amount",
                NumericGreaterThan: 10000,
                Next: "HighValueApproval"
              },
              {
                Variable: "$.amount",
                NumericLessThanEquals: 10000,
                Next: "StandardApproval"
              }
            ],
            Default: "StandardApproval"
          },
          "HighValueApproval": {
            Type: "Task",
            Resource: "arn:aws:states:::approval",
            Parameters: {
              "approver": "director",
              "message": "High value request requires director approval"
            },
            Next: "FinalNotification"
          },
          "StandardApproval": {
            Type: "Task",
            Resource: "arn:aws:states:::approval",
            Parameters: {
              "approver": "manager",
              "message": "Standard approval required"
            },
            Next: "FinalNotification"
          },
          "FinalNotification": {
            Type: "Pass",
            Parameters: {
              "message": "Approval process completed"
            },
            End: true
          }
        }
      }
    },
    parallel: {
      name: "Parallel Processing Workflow",
      definition: {
        Comment: "Workflow with parallel processing",
        StartAt: "ParallelProcessing",
        States: {
          "ParallelProcessing": {
            Type: "Parallel",
            Branches: [
              {
                StartAt: "ProcessA",
                States: {
                  "ProcessA": {
                    Type: "Task",
                    Resource: "arn:aws:states:::task",
                    Parameters: {
                      "task": "financial_check"
                    },
                    End: true
                  }
                }
              },
              {
                StartAt: "ProcessB",
                States: {
                  "ProcessB": {
                    Type: "Task",
                    Resource: "arn:aws:states:::task",
                    Parameters: {
                      "task": "compliance_check"
                    },
                    End: true
                  }
                }
              }
            ],
            Next: "CombineResults"
          },
          "CombineResults": {
            Type: "Pass",
            Parameters: {
              "message": "All parallel processes completed"
            },
            End: true
          }
        }
      }
    },
    errorHandling: {
      name: "Workflow with Error Handling",
      definition: {
        Comment: "Workflow demonstrating retry and catch mechanisms",
        StartAt: "ProcessTask",
        States: {
          "ProcessTask": {
            Type: "Task",
            Resource: "arn:aws:states:::task",
            Parameters: {
              "task": "risky_operation"
            },
            Retry: [
              {
                ErrorEquals: ["States.TaskFailed"],
                IntervalSeconds: 2,
                MaxAttempts: 3,
                BackoffRate: 2.0
              }
            ],
            Catch: [
              {
                ErrorEquals: ["States.ALL"],
                Next: "HandleError",
                ResultPath: "$.error"
              }
            ],
            Next: "Success"
          },
          "Success": {
            Type: "Pass",
            Parameters: {
              "message": "Task completed successfully"
            },
            End: true
          },
          "HandleError": {
            Type: "Pass",
            Parameters: {
              "message": "Task failed, but error was handled"
            },
            End: true
          }
        }
      }
    }
  };

  const generateASLFromText = async () => {
    if (!businessProcess.trim()) {
      toast.error('Please enter a business process description');
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-asl-workflow', {
        body: { businessProcess }
      });

      if (error) throw error;

      setAslDefinition(JSON.stringify(data.aslWorkflow, null, 2));
      toast.success('ASL workflow generated successfully!');
      
      // Auto-validate the generated workflow
      const result = aslParser.validateASL(data.aslWorkflow);
      setValidationResult(result);
    } catch (error) {
      console.error('Error generating ASL workflow:', error);
      toast.error('Failed to generate ASL workflow');
    } finally {
      setIsGenerating(false);
    }
  };

  const validateASL = () => {
    try {
      const asl: ASLStateMachine = JSON.parse(aslDefinition);
      const result = aslParser.validateASL(asl);
      setValidationResult(result);
    } catch (error) {
      setValidationResult({
        valid: false,
        errors: [`Invalid JSON: ${(error as Error).message}`]
      });
    }
  };

  const executeASLWorkflow = async () => {
    try {
      setIsExecuting(true);
      setExecutionResult('');
      
      const asl: ASLStateMachine = JSON.parse(aslDefinition);
      const requestData = { amount: 15000, user_id: 'demo-user' }; // Example data
      
      const workflowId = await workflowEngine.executeASLWorkflow(
        asl,
        requestData,
        'ASL Demo Workflow',
        'demo-user'
      );
      
      setExecutionResult(`Workflow executed successfully. ID: ${workflowId}`);
    } catch (error) {
      setExecutionResult(`Execution failed: ${(error as Error).message}`);
    } finally {
      setIsExecuting(false);
    }
  };

  const createTemplateFromASL = async () => {
    try {
      const asl: ASLStateMachine = JSON.parse(aslDefinition);
      const templateId = await workflowEngine.createWorkflowFromASL(
        asl,
        'ASL Demo Template',
        'asl_demo'
      );
      setExecutionResult(`Template created successfully. ID: ${templateId}`);
    } catch (error) {
      setExecutionResult(`Template creation failed: ${(error as Error).message}`);
    }
  };

  const loadExample = (example: keyof typeof exampleDefinitions) => {
    setAslDefinition(JSON.stringify(exampleDefinitions[example].definition, null, 2));
    setValidationResult(null);
    setExecutionResult('');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="w-5 h-5" />
            Amazon States Language (ASL) Workflow Demo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="editor" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="editor">ASL Editor</TabsTrigger>
              <TabsTrigger value="examples">Examples</TabsTrigger>
              <TabsTrigger value="features">ASL Features</TabsTrigger>
            </TabsList>
            
            <TabsContent value="editor" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Generate ASL from Business Process
                  </label>
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Describe your business process in plain English (e.g., 'Employee expense approval workflow that requires manager approval for amounts over $500')"
                      value={businessProcess}
                      onChange={(e) => setBusinessProcess(e.target.value)}
                      className="min-h-[100px]"
                    />
                    <Button 
                      onClick={generateASLFromText}
                      disabled={isGenerating || !businessProcess.trim()}
                      className="w-full"
                    >
                      {isGenerating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Generating ASL Workflow...
                        </>
                      ) : (
                        <>
                          <Wand2 className="h-4 w-4 mr-2" />
                          Generate ASL Workflow with AI
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    ASL Definition (JSON)
                  </label>
                  <Textarea
                    value={aslDefinition}
                    onChange={(e) => setAslDefinition(e.target.value)}
                    placeholder="Generated ASL definition will appear here or enter manually..."
                    className="min-h-[300px] font-mono text-sm"
                  />
                </div>
                
                <div className="flex gap-2 flex-wrap">
                  <Button onClick={validateASL} variant="outline">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Validate ASL
                  </Button>
                  <Button 
                    onClick={executeASLWorkflow} 
                    disabled={!validationResult?.valid || isExecuting}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    {isExecuting ? 'Executing...' : 'Execute Workflow'}
                  </Button>
                  <Button 
                    onClick={createTemplateFromASL} 
                    variant="secondary"
                    disabled={!validationResult?.valid}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Create Template
                  </Button>
                </div>
                
                {validationResult && (
                  <Alert>
                    <div className="flex items-center gap-2">
                      {validationResult.valid ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <Badge variant="default" className="bg-green-500">Valid</Badge>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-red-500" />
                          <Badge variant="destructive">Invalid</Badge>
                        </>
                      )}
                    </div>
                    <AlertDescription className="mt-2">
                      {validationResult.valid ? (
                        "ASL definition is valid and ready for execution."
                      ) : (
                        <div>
                          <p>Validation errors:</p>
                          <ul className="list-disc list-inside mt-2">
                            {validationResult.errors.map((error, index) => (
                              <li key={index} className="text-sm">{error}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                )}
                
                {executionResult && (
                  <Alert>
                    <AlertDescription>{executionResult}</AlertDescription>
                  </Alert>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="examples" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(exampleDefinitions).map(([key, example]) => (
                  <Card key={key} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">{example.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        {example.definition.Comment}
                      </p>
                      <Button 
                        onClick={() => loadExample(key as keyof typeof exampleDefinitions)}
                        size="sm"
                      >
                        Load Example
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="features" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      Supported ASL Features
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li>✅ Task States (approval, notification)</li>
                      <li>✅ Choice States (conditional branching)</li>
                      <li>✅ Parallel States (concurrent execution)</li>
                      <li>✅ Wait States (time delays)</li>
                      <li>✅ Map States (iteration)</li>
                      <li>✅ Pass States (data transformation)</li>
                      <li>✅ Succeed/Fail States</li>
                      <li>✅ Retry mechanism</li>
                      <li>✅ Catch error handling</li>
                      <li>✅ JSONPath data access</li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-blue-500" />
                      Benefits of ASL
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li>🔄 Industry-standard format</li>
                      <li>📊 Visual workflow representation</li>
                      <li>🛡️ Built-in error handling</li>
                      <li>⚡ Parallel execution support</li>
                      <li>🔀 Complex conditional logic</li>
                      <li>♻️ Retry mechanisms</li>
                      <li>🔄 State transitions</li>
                      <li>📝 Rich metadata support</li>
                      <li>🔗 Easy integration with AWS</li>
                      <li>🎯 Clear execution flow</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>ASL vs Traditional Workflow Definition</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Traditional Format:</h4>
                      <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
{`{
  "steps": [
    {
      "id": "approval",
      "type": "approval",
      "role": "manager"
    }
  ]
}`}
                      </pre>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">ASL Format:</h4>
                      <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
{`{
  "StartAt": "RequestApproval",
  "States": {
    "RequestApproval": {
      "Type": "Task",
      "Resource": "approval",
      "Parameters": {
        "approver": "manager"
      },
      "End": true
    }
  }
}`}
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}