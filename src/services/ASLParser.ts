// Amazon States Language (ASL) Parser for Workflow Engine
// Converts ASL JSON definitions to our internal workflow format

export interface ASLState {
  Type: 'Task' | 'Choice' | 'Parallel' | 'Wait' | 'Succeed' | 'Fail' | 'Pass' | 'Map';
  Comment?: string;
  Next?: string;
  End?: boolean;
  
  // Task-specific properties
  Resource?: string;
  Parameters?: any;
  ResultPath?: string;
  OutputPath?: string;
  InputPath?: string;
  
  // Choice-specific properties
  Choices?: Array<{
    Variable: string;
    NumericEquals?: number;
    NumericGreaterThan?: number;
    NumericLessThan?: number;
    StringEquals?: string;
    BooleanEquals?: boolean;
    Next: string;
  }>;
  Default?: string;
  
  // Parallel-specific properties
  Branches?: ASLStateMachine[];
  
  // Wait-specific properties
  Seconds?: number;
  Timestamp?: string;
  SecondsPath?: string;
  TimestampPath?: string;
  
  // Map-specific properties
  Iterator?: ASLStateMachine;
  ItemsPath?: string;
  MaxConcurrency?: number;
  
  // Error handling
  Retry?: Array<{
    ErrorEquals: string[];
    IntervalSeconds?: number;
    MaxAttempts?: number;
    BackoffRate?: number;
  }>;
  Catch?: Array<{
    ErrorEquals: string[];
    Next: string;
    ResultPath?: string;
  }>;
}

export interface ASLStateMachine {
  Comment?: string;
  StartAt: string;
  States: Record<string, ASLState>;
  TimeoutSeconds?: number;
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: 'approval' | 'notification' | 'conditional' | 'parallel' | 'loop' | 'event' | 'wait' | 'task';
  role?: string;
  conditions?: Array<{
    field: string;
    operator: string;
    value: any;
  }>;
  parallel_steps?: WorkflowStep[];
  next_step?: string;
  end?: boolean;
  
  // ASL-specific properties
  resource?: string;
  parameters?: any;
  result_path?: string;
  output_path?: string;
  input_path?: string;
  
  // Wait configuration
  wait_config?: {
    seconds?: number;
    timestamp?: string;
    seconds_path?: string;
    timestamp_path?: string;
  };
  
  // Map configuration  
  map_config?: {
    iterator_steps?: WorkflowStep[];
    items_path?: string;
    max_concurrency?: number;
  };
  
  // Enhanced failure handling from ASL
  failure_config?: {
    retry_attempts?: number;
    retry_delay_seconds?: number;
    backoff_rate?: number;
    on_failure: 'terminate' | 'continue' | 'escalate' | 'alternate_path';
    alternate_step_id?: string;
    escalation_role?: string;
    catch_handlers?: Array<{
      error_types: string[];
      next_step: string;
      result_path?: string;
    }>;
  };
}

export class ASLParser {
  /**
   * Parse ASL definition and convert to internal workflow format
   */
  parseASLWorkflow(aslDefinition: ASLStateMachine): WorkflowStep[] {
    const steps: WorkflowStep[] = [];
    const visitedStates = new Set<string>();
    
    // Start from the initial state
    this.parseStateRecursively(
      aslDefinition.StartAt,
      aslDefinition.States,
      steps,
      visitedStates
    );
    
    return steps;
  }
  
  private parseStateRecursively(
    stateName: string,
    states: Record<string, ASLState>,
    steps: WorkflowStep[],
    visited: Set<string>
  ): void {
    if (visited.has(stateName) || !states[stateName]) {
      return;
    }
    
    visited.add(stateName);
    const state = states[stateName];
    
    const step = this.convertASLStateToWorkflowStep(stateName, state);
    steps.push(step);
    
    // Handle different state types
    switch (state.Type) {
      case 'Choice':
        this.handleChoiceState(state, states, steps, visited);
        break;
        
      case 'Parallel':
        this.handleParallelState(state, step);
        break;
        
      case 'Map':
        this.handleMapState(state, step);
        break;
        
      default:
        // Continue to next state
        if (state.Next && !state.End) {
          this.parseStateRecursively(state.Next, states, steps, visited);
        }
    }
  }
  
  private convertASLStateToWorkflowStep(stateName: string, state: ASLState): WorkflowStep {
    const step: WorkflowStep = {
      id: stateName,
      name: state.Comment || stateName,
      type: this.mapASLTypeToWorkflowType(state.Type),
      next_step: state.Next,
      end: state.End || false
    };
    
    // Add ASL-specific properties
    if (state.Resource) step.resource = state.Resource;
    if (state.Parameters) step.parameters = state.Parameters;
    if (state.ResultPath) step.result_path = state.ResultPath;
    if (state.OutputPath) step.output_path = state.OutputPath;
    if (state.InputPath) step.input_path = state.InputPath;
    
    // Handle Wait state
    if (state.Type === 'Wait') {
      step.wait_config = {
        seconds: state.Seconds,
        timestamp: state.Timestamp,
        seconds_path: state.SecondsPath,
        timestamp_path: state.TimestampPath
      };
    }
    
    // Handle error handling (Retry/Catch)
    if (state.Retry || state.Catch) {
      step.failure_config = {
        on_failure: 'continue', // Default behavior
        catch_handlers: []
      };
      
      if (state.Retry && state.Retry.length > 0) {
        const retry = state.Retry[0]; // Use first retry configuration
        step.failure_config.retry_attempts = retry.MaxAttempts || 3;
        step.failure_config.retry_delay_seconds = retry.IntervalSeconds || 2;
        step.failure_config.backoff_rate = retry.BackoffRate || 2.0;
      }
      
      if (state.Catch) {
        step.failure_config.catch_handlers = state.Catch.map(catchHandler => ({
          error_types: catchHandler.ErrorEquals,
          next_step: catchHandler.Next,
          result_path: catchHandler.ResultPath
        }));
      }
    }
    
    return step;
  }
  
  private mapASLTypeToWorkflowType(aslType: string): WorkflowStep['type'] {
    switch (aslType) {
      case 'Task':
        return 'task';
      case 'Choice':
        return 'conditional';
      case 'Parallel':
        return 'parallel';
      case 'Wait':
        return 'wait';
      case 'Map':
        return 'loop';
      case 'Pass':
        return 'notification';
      default:
        return 'task';
    }
  }
  
  private handleChoiceState(
    state: ASLState,
    states: Record<string, ASLState>,
    steps: WorkflowStep[],
    visited: Set<string>
  ): void {
    if (!state.Choices) return;
    
    // Convert ASL choices to workflow conditions
    const step = steps[steps.length - 1]; // Get the just-added choice step
    step.conditions = [];
    
    for (const choice of state.Choices) {
      const condition = this.convertASLChoiceToCondition(choice);
      if (condition) {
        step.conditions.push(condition);
      }
      
      // Parse the next state for this choice
      this.parseStateRecursively(choice.Next, states, steps, visited);
    }
    
    // Handle default path
    if (state.Default) {
      this.parseStateRecursively(state.Default, states, steps, visited);
    }
  }
  
  private convertASLChoiceToCondition(choice: any): any | null {
    const field = choice.Variable.replace('$.', ''); // Remove JSONPath prefix
    
    if (choice.NumericEquals !== undefined) {
      return { field, operator: '==', value: choice.NumericEquals };
    } else if (choice.NumericGreaterThan !== undefined) {
      return { field, operator: '>', value: choice.NumericGreaterThan };
    } else if (choice.NumericLessThan !== undefined) {
      return { field, operator: '<', value: choice.NumericLessThan };
    } else if (choice.StringEquals !== undefined) {
      return { field, operator: '==', value: choice.StringEquals };
    } else if (choice.BooleanEquals !== undefined) {
      return { field, operator: '==', value: choice.BooleanEquals };
    }
    
    return null;
  }
  
  private handleParallelState(state: ASLState, step: WorkflowStep): void {
    if (!state.Branches) return;
    
    step.parallel_steps = [];
    
    for (const branch of state.Branches) {
      const branchSteps = this.parseASLWorkflow(branch);
      step.parallel_steps.push(...branchSteps);
    }
  }
  
  private handleMapState(state: ASLState, step: WorkflowStep): void {
    if (!state.Iterator) return;
    
    step.map_config = {
      items_path: state.ItemsPath,
      max_concurrency: state.MaxConcurrency,
      iterator_steps: this.parseASLWorkflow(state.Iterator)
    };
  }
  
  /**
   * Convert internal workflow format back to ASL
   */
  convertWorkflowToASL(steps: WorkflowStep[], workflowName: string): ASLStateMachine {
    const states: Record<string, ASLState> = {};
    let startAt = '';
    
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      
      if (i === 0) {
        startAt = step.id;
      }
      
      const aslState = this.convertWorkflowStepToASLState(step, steps, i);
      states[step.id] = aslState;
    }
    
    return {
      Comment: `ASL workflow: ${workflowName}`,
      StartAt: startAt,
      States: states
    };
  }
  
  private convertWorkflowStepToASLState(
    step: WorkflowStep,
    allSteps: WorkflowStep[],
    index: number
  ): ASLState {
    const state: ASLState = {
      Type: this.mapWorkflowTypeToASLType(step.type),
      Comment: step.name
    };
    
    // Handle state transitions
    if (step.next_step) {
      state.Next = step.next_step;
    } else if (step.end || index === allSteps.length - 1) {
      state.End = true;
    } else if (index < allSteps.length - 1) {
      state.Next = allSteps[index + 1].id;
    }
    
    // Add ASL-specific properties
    if (step.resource) state.Resource = step.resource;
    if (step.parameters) state.Parameters = step.parameters;
    if (step.result_path) state.ResultPath = step.result_path;
    if (step.output_path) state.OutputPath = step.output_path;
    if (step.input_path) state.InputPath = step.input_path;
    
    // Handle Wait state
    if (step.wait_config) {
      if (step.wait_config.seconds) state.Seconds = step.wait_config.seconds;
      if (step.wait_config.timestamp) state.Timestamp = step.wait_config.timestamp;
      if (step.wait_config.seconds_path) state.SecondsPath = step.wait_config.seconds_path;
      if (step.wait_config.timestamp_path) state.TimestampPath = step.wait_config.timestamp_path;
    }
    
    // Handle Choice state
    if (step.type === 'conditional' && step.conditions) {
      state.Choices = step.conditions.map(condition => 
        this.convertConditionToASLChoice(condition, step.next_step || '')
      );
    }
    
    // Handle Parallel state
    if (step.type === 'parallel' && step.parallel_steps) {
      state.Branches = this.groupParallelStepsIntoBranches(step.parallel_steps);
    }
    
    // Handle Map state
    if (step.type === 'loop' && step.map_config) {
      if (step.map_config.items_path) state.ItemsPath = step.map_config.items_path;
      if (step.map_config.max_concurrency) state.MaxConcurrency = step.map_config.max_concurrency;
      if (step.map_config.iterator_steps) {
        state.Iterator = this.convertWorkflowToASL(step.map_config.iterator_steps, 'Iterator');
      }
    }
    
    // Handle error handling
    if (step.failure_config) {
      if (step.failure_config.retry_attempts) {
        state.Retry = [{
          ErrorEquals: ['States.ALL'],
          MaxAttempts: step.failure_config.retry_attempts,
          IntervalSeconds: step.failure_config.retry_delay_seconds || 2,
          BackoffRate: step.failure_config.backoff_rate || 2.0
        }];
      }
      
      if (step.failure_config.catch_handlers) {
        state.Catch = step.failure_config.catch_handlers.map(handler => ({
          ErrorEquals: handler.error_types,
          Next: handler.next_step,
          ResultPath: handler.result_path
        }));
      }
    }
    
    return state;
  }
  
  private mapWorkflowTypeToASLType(workflowType: string): ASLState['Type'] {
    switch (workflowType) {
      case 'task':
      case 'approval':
        return 'Task';
      case 'conditional':
        return 'Choice';
      case 'parallel':
        return 'Parallel';
      case 'wait':
        return 'Wait';
      case 'loop':
        return 'Map';
      case 'notification':
        return 'Pass';
      default:
        return 'Task';
    }
  }
  
  private convertConditionToASLChoice(condition: any, nextStep: string): any {
    const choice: any = {
      Variable: `$.${condition.field}`,
      Next: nextStep
    };
    
    const value = condition.value;
    const operator = condition.operator;
    
    if (typeof value === 'number') {
      switch (operator) {
        case '==':
        case '=':
          choice.NumericEquals = value;
          break;
        case '>':
          choice.NumericGreaterThan = value;
          break;
        case '<':
          choice.NumericLessThan = value;
          break;
        case '>=':
          choice.NumericGreaterThanEquals = value;
          break;
        case '<=':
          choice.NumericLessThanEquals = value;
          break;
      }
    } else if (typeof value === 'string') {
      if (operator === '==' || operator === '=') {
        choice.StringEquals = value;
      }
    } else if (typeof value === 'boolean') {
      if (operator === '==' || operator === '=') {
        choice.BooleanEquals = value;
      }
    }
    
    return choice;
  }
  
  private groupParallelStepsIntoBranches(parallelSteps: WorkflowStep[]): ASLStateMachine[] {
    // Simple implementation: each step becomes its own branch
    // In a more sophisticated implementation, you might group related steps
    return parallelSteps.map(step => 
      this.convertWorkflowToASL([step], `Branch_${step.id}`)
    );
  }
  
  /**
   * Validate ASL definition
   */
  validateASL(asl: ASLStateMachine): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Check required fields
    if (!asl.StartAt) {
      errors.push('Missing required field: StartAt');
    }
    
    if (!asl.States || Object.keys(asl.States).length === 0) {
      errors.push('Missing or empty States definition');
    }
    
    // Check if StartAt state exists
    if (asl.StartAt && !asl.States[asl.StartAt]) {
      errors.push(`StartAt state '${asl.StartAt}' not found in States`);
    }
    
    // Validate each state
    for (const [stateName, state] of Object.entries(asl.States)) {
      const stateErrors = this.validateState(stateName, state, asl.States);
      errors.push(...stateErrors);
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  private validateState(stateName: string, state: ASLState, allStates: Record<string, ASLState>): string[] {
    const errors: string[] = [];
    
    // Check required Type field
    if (!state.Type) {
      errors.push(`State '${stateName}' missing required field: Type`);
    }
    
    // Validate transitions
    if (state.Next && !allStates[state.Next]) {
      errors.push(`State '${stateName}' references non-existent Next state: ${state.Next}`);
    }
    
    // Type-specific validations
    switch (state.Type) {
      case 'Choice':
        if (!state.Choices || state.Choices.length === 0) {
          errors.push(`Choice state '${stateName}' must have at least one choice`);
        }
        break;
        
      case 'Parallel':
        if (!state.Branches || state.Branches.length === 0) {
          errors.push(`Parallel state '${stateName}' must have at least one branch`);
        }
        break;
        
      case 'Task':
        if (!state.Resource) {
          errors.push(`Task state '${stateName}' must have a Resource`);
        }
        break;
    }
    
    return errors;
  }
}

export const aslParser = new ASLParser();