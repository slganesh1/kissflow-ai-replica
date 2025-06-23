export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      decision_impact: "low" | "medium" | "high"
      decision_status: "pending" | "approved" | "executed" | "rejected"
      prediction_type:
        | "workflow_demand"
        | "resource_need"
        | "bottleneck"
        | "completion_time"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      decision_impact: ["low", "medium", "high"],
      decision_status: ["pending", "approved", "executed", "rejected"],
      prediction_type: [
        "workflow_demand",
        "resource_need",
        "bottleneck",
        "completion_time",
      ],
    },
  },
} as const
