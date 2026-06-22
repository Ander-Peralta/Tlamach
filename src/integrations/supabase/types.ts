export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      badges: {
        Row: {
          badge_key: string
          earned_at: string
          id: string
          user_code: string
        }
        Insert: {
          badge_key: string
          earned_at?: string
          id?: string
          user_code: string
        }
        Update: {
          badge_key?: string
          earned_at?: string
          id?: string
          user_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "badges_user_code_fkey"
            columns: ["user_code"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["code"]
          },
        ]
      }
      budget_categories: {
        Row: {
          created_at: string
          id: string
          monthly_limit: number
          name: string
          user_code: string
        }
        Insert: {
          created_at?: string
          id?: string
          monthly_limit?: number
          name: string
          user_code: string
        }
        Update: {
          created_at?: string
          id?: string
          monthly_limit?: number
          name?: string
          user_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "budget_categories_user_code_fkey"
            columns: ["user_code"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["code"]
          },
        ]
      }
      debts: {
        Row: {
          amount: number
          created_at: string
          id: string
          interest_rate: number
          min_payment: number
          name: string
          strategy: string | null
          user_code: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          interest_rate?: number
          min_payment?: number
          name: string
          strategy?: string | null
          user_code: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          interest_rate?: number
          min_payment?: number
          name?: string
          strategy?: string | null
          user_code?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          date: string
          id: string
          kind: string | null
          note: string | null
          user_code: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          date?: string
          id?: string
          kind?: string | null
          note?: string | null
          user_code: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          date?: string
          id?: string
          kind?: string | null
          note?: string | null
          user_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_user_code_fkey"
            columns: ["user_code"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["code"]
          },
        ]
      }
      goal_contributions: {
        Row: {
          amount: number
          created_at: string
          date: string
          goal_id: string
          id: string
          user_code: string
        }
        Insert: {
          amount: number
          created_at?: string
          date?: string
          goal_id: string
          id?: string
          user_code: string
        }
        Update: {
          amount?: number
          created_at?: string
          date?: string
          goal_id?: string
          id?: string
          user_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "goal_contributions_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goal_contributions_user_code_fkey"
            columns: ["user_code"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["code"]
          },
        ]
      }
      goals: {
        Row: {
          created_at: string
          deadline: string | null
          id: string
          is_active: boolean
          monthly_contribution: number
          name: string
          target_amount: number
          user_code: string
        }
        Insert: {
          created_at?: string
          deadline?: string | null
          id?: string
          is_active?: boolean
          monthly_contribution?: number
          name: string
          target_amount: number
          user_code: string
        }
        Update: {
          created_at?: string
          deadline?: string | null
          id?: string
          is_active?: boolean
          monthly_contribution?: number
          name?: string
          target_amount?: number
          user_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "goals_user_code_fkey"
            columns: ["user_code"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["code"]
          },
        ]
      }
      habit_completions: {
        Row: {
          date: string
          habit_id: string
          id: string
          user_code: string
        }
        Insert: {
          date?: string
          habit_id: string
          id?: string
          user_code: string
        }
        Update: {
          date?: string
          habit_id?: string
          id?: string
          user_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "habit_completions_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "habit_completions_user_code_fkey"
            columns: ["user_code"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["code"]
          },
        ]
      }
      habits: {
        Row: {
          created_at: string
          id: string
          name: string
          user_code: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          user_code: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          user_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "habits_user_code_fkey"
            columns: ["user_code"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["code"]
          },
        ]
      }
      lesson_progress: {
        Row: {
          completed_at: string
          id: string
          lesson_id: string
          user_code: string
        }
        Insert: {
          completed_at?: string
          id?: string
          lesson_id: string
          user_code: string
        }
        Update: {
          completed_at?: string
          id?: string
          lesson_id?: string
          user_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_user_code_fkey"
            columns: ["user_code"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["code"]
          },
        ]
      }
      users: {
        Row: {
          code: string
          created_at: string
          current_rank: number
          current_streak: number
          last_activity_date: string | null
          long_term_goals: Json | null
          max_streak: number
          monthly_income: number
          monthly_review_enabled: boolean
          onboarding_answers: Json | null
          total_xp: number
        }
        Insert: {
          code: string
          created_at?: string
          current_rank?: number
          current_streak?: number
          last_activity_date?: string | null
          long_term_goals?: Json | null
          max_streak?: number
          monthly_income?: number
          monthly_review_enabled?: boolean
          onboarding_answers?: Json | null
          total_xp?: number
        }
        Update: {
          code?: string
          created_at?: string
          current_rank?: number
          current_streak?: number
          last_activity_date?: string | null
          long_term_goals?: Json | null
          max_streak?: number
          monthly_income?: number
          monthly_review_enabled?: boolean
          onboarding_answers?: Json | null
          total_xp?: number
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
      [_ in never]: never
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
    Enums: {},
  },
} as const
