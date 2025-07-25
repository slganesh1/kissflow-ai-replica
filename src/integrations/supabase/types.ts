export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      decision_rules: {
        Row: {
          action: string
          condition: string
          created_at: string | null
          enabled: boolean | null
          id: string
          name: string
          priority: number
          updated_at: string | null
        }
        Insert: {
          action: string
          condition: string
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          name: string
          priority: number
          updated_at?: string | null
        }
        Update: {
          action?: string
          condition?: string
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          name?: string
          priority?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      decisions: {
        Row: {
          confidence: number
          context: string
          created_at: string | null
          id: string
          impact: Database["public"]["Enums"]["decision_impact"]
          options: Json
          reasoning: string
          recommended_action: string
          status: Database["public"]["Enums"]["decision_status"] | null
          updated_at: string | null
        }
        Insert: {
          confidence: number
          context: string
          created_at?: string | null
          id?: string
          impact: Database["public"]["Enums"]["decision_impact"]
          options: Json
          reasoning: string
          recommended_action: string
          status?: Database["public"]["Enums"]["decision_status"] | null
          updated_at?: string | null
        }
        Update: {
          confidence?: number
          context?: string
          created_at?: string | null
          id?: string
          impact?: Database["public"]["Enums"]["decision_impact"]
          options?: Json
          reasoning?: string
          recommended_action?: string
          status?: Database["public"]["Enums"]["decision_status"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      optimization_metrics: {
        Row: {
          change_percentage: number | null
          created_at: string | null
          current_value: number
          id: string
          measurement_date: string | null
          metric_name: string
          metric_type: string
          previous_value: number | null
        }
        Insert: {
          change_percentage?: number | null
          created_at?: string | null
          current_value: number
          id?: string
          measurement_date?: string | null
          metric_name: string
          metric_type: string
          previous_value?: number | null
        }
        Update: {
          change_percentage?: number | null
          created_at?: string | null
          current_value?: number
          id?: string
          measurement_date?: string | null
          metric_name?: string
          metric_type?: string
          previous_value?: number | null
        }
        Relationships: []
      }
      predictions: {
        Row: {
          based_on: Json
          created_at: string | null
          description: string
          id: string
          impact: Database["public"]["Enums"]["decision_impact"]
          probability: number
          recommended_action: string
          timeframe: string
          title: string
          type: Database["public"]["Enums"]["prediction_type"]
          updated_at: string | null
        }
        Insert: {
          based_on: Json
          created_at?: string | null
          description: string
          id?: string
          impact: Database["public"]["Enums"]["decision_impact"]
          probability: number
          recommended_action: string
          timeframe: string
          title: string
          type: Database["public"]["Enums"]["prediction_type"]
          updated_at?: string | null
        }
        Update: {
          based_on?: Json
          created_at?: string | null
          description?: string
          id?: string
          impact?: Database["public"]["Enums"]["decision_impact"]
          probability?: number
          recommended_action?: string
          timeframe?: string
          title?: string
          type?: Database["public"]["Enums"]["prediction_type"]
          updated_at?: string | null
        }
        Relationships: []
      }
      workflow_approvals: {
        Row: {
          approved_at: string | null
          approver_id: string | null
          approver_role: string
          assigned_at: string | null
          created_at: string | null
          deadline: string | null
          escalated: boolean | null
          id: string
          order_sequence: number
          rejection_reason: string | null
          status: Database["public"]["Enums"]["approval_status"] | null
          step_id: string
          step_name: string
          updated_at: string | null
          workflow_id: string | null
        }
        Insert: {
          approved_at?: string | null
          approver_id?: string | null
          approver_role: string
          assigned_at?: string | null
          created_at?: string | null
          deadline?: string | null
          escalated?: boolean | null
          id?: string
          order_sequence: number
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["approval_status"] | null
          step_id: string
          step_name: string
          updated_at?: string | null
          workflow_id?: string | null
        }
        Update: {
          approved_at?: string | null
          approver_id?: string | null
          approver_role?: string
          assigned_at?: string | null
          created_at?: string | null
          deadline?: string | null
          escalated?: boolean | null
          id?: string
          order_sequence?: number
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["approval_status"] | null
          step_id?: string
          step_name?: string
          updated_at?: string | null
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_approvals_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflow_executions"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_escalations: {
        Row: {
          approval_id: string | null
          escalated_at: string
          escalated_from: string
          escalated_to: string
          escalation_reason: string
          id: string
          resolved_at: string | null
          status: string | null
          workflow_id: string
        }
        Insert: {
          approval_id?: string | null
          escalated_at?: string
          escalated_from: string
          escalated_to: string
          escalation_reason: string
          id?: string
          resolved_at?: string | null
          status?: string | null
          workflow_id: string
        }
        Update: {
          approval_id?: string | null
          escalated_at?: string
          escalated_from?: string
          escalated_to?: string
          escalation_reason?: string
          id?: string
          resolved_at?: string | null
          status?: string | null
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_escalations_approval_id_fkey"
            columns: ["approval_id"]
            isOneToOne: false
            referencedRelation: "workflow_approvals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_escalations_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflow_executions"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_execution_log: {
        Row: {
          action: string
          actor: string | null
          details: Json | null
          id: string
          step_id: string | null
          timestamp: string | null
          workflow_id: string | null
        }
        Insert: {
          action: string
          actor?: string | null
          details?: Json | null
          id?: string
          step_id?: string | null
          timestamp?: string | null
          workflow_id?: string | null
        }
        Update: {
          action?: string
          actor?: string | null
          details?: Json | null
          id?: string
          step_id?: string | null
          timestamp?: string | null
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_execution_log_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflow_executions"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_executions: {
        Row: {
          created_at: string | null
          id: string
          request_data: Json
          sla_deadline: string | null
          sla_status: string | null
          status: Database["public"]["Enums"]["workflow_status"] | null
          submitter_name: string
          updated_at: string | null
          workflow_name: string
          workflow_type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          request_data: Json
          sla_deadline?: string | null
          sla_status?: string | null
          status?: Database["public"]["Enums"]["workflow_status"] | null
          submitter_name: string
          updated_at?: string | null
          workflow_name: string
          workflow_type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          request_data?: Json
          sla_deadline?: string | null
          sla_status?: string | null
          status?: Database["public"]["Enums"]["workflow_status"] | null
          submitter_name?: string
          updated_at?: string | null
          workflow_name?: string
          workflow_type?: string
        }
        Relationships: []
      }
      workflow_patterns: {
        Row: {
          confidence: number
          created_at: string | null
          frequency: string
          id: string
          name: string
          next_predicted: string
          suggested_preparation: string
          triggers: Json
          updated_at: string | null
        }
        Insert: {
          confidence: number
          created_at?: string | null
          frequency: string
          id?: string
          name: string
          next_predicted: string
          suggested_preparation: string
          triggers: Json
          updated_at?: string | null
        }
        Update: {
          confidence?: number
          created_at?: string | null
          frequency?: string
          id?: string
          name?: string
          next_predicted?: string
          suggested_preparation?: string
          triggers?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      workflow_sla_config: {
        Row: {
          auto_approve_on_expire: boolean | null
          created_at: string
          escalation_hours: number
          id: string
          sla_hours: number
          step_type: string
          updated_at: string
          workflow_type: string
        }
        Insert: {
          auto_approve_on_expire?: boolean | null
          created_at?: string
          escalation_hours?: number
          id?: string
          sla_hours?: number
          step_type: string
          updated_at?: string
          workflow_type: string
        }
        Update: {
          auto_approve_on_expire?: boolean | null
          created_at?: string
          escalation_hours?: number
          id?: string
          sla_hours?: number
          step_type?: string
          updated_at?: string
          workflow_type?: string
        }
        Relationships: []
      }
      workflow_sla_notifications: {
        Row: {
          id: string
          message: string
          notification_type: string
          recipient_role: string
          sent_at: string
          workflow_id: string
        }
        Insert: {
          id?: string
          message: string
          notification_type: string
          recipient_role: string
          sent_at?: string
          workflow_id: string
        }
        Update: {
          id?: string
          message?: string
          notification_type?: string
          recipient_role?: string
          sent_at?: string
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_sla_notifications_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflow_executions"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_tasks: {
        Row: {
          assigned_role: string | null
          assigned_to: string | null
          completed_at: string | null
          created_at: string | null
          data: Json | null
          deadline: string | null
          id: string
          priority: number | null
          status: string | null
          step_id: string
          task_type: string
          updated_at: string | null
          workflow_id: string | null
        }
        Insert: {
          assigned_role?: string | null
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          data?: Json | null
          deadline?: string | null
          id?: string
          priority?: number | null
          status?: string | null
          step_id: string
          task_type: string
          updated_at?: string | null
          workflow_id?: string | null
        }
        Update: {
          assigned_role?: string | null
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          data?: Json | null
          deadline?: string | null
          id?: string
          priority?: number | null
          status?: string | null
          step_id?: string
          task_type?: string
          updated_at?: string | null
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_tasks_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflow_executions"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_templates: {
        Row: {
          active: boolean | null
          created_at: string | null
          definition: Json
          id: string
          name: string
          type: string
          updated_at: string | null
          version: number | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          definition: Json
          id?: string
          name: string
          type: string
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          definition?: Json
          id?: string
          name?: string
          type?: string
          updated_at?: string | null
          version?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      escalate_overdue_approvals: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_workflow_sla_status: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      approval_status: "pending" | "approved" | "rejected"
      decision_impact: "low" | "medium" | "high"
      decision_status: "pending" | "approved" | "executed" | "rejected"
      prediction_type:
        | "workflow_demand"
        | "resource_need"
        | "bottleneck"
        | "completion_time"
      workflow_status:
        | "pending"
        | "in_progress"
        | "completed"
        | "failed"
        | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      approval_status: ["pending", "approved", "rejected"],
      decision_impact: ["low", "medium", "high"],
      decision_status: ["pending", "approved", "executed", "rejected"],
      prediction_type: [
        "workflow_demand",
        "resource_need",
        "bottleneck",
        "completion_time",
      ],
      workflow_status: [
        "pending",
        "in_progress",
        "completed",
        "failed",
        "cancelled",
      ],
    },
  },
} as const
