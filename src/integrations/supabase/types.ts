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
      achievements: {
        Row: {
          category: string | null
          created_at: string
          description: string
          icon: string
          id: number
          requirement_value: number
          title: string
          type: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description: string
          icon: string
          id?: number
          requirement_value: number
          title: string
          type: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string
          icon?: string
          id?: number
          requirement_value?: number
          title?: string
          type?: string
        }
        Relationships: []
      }
      affiliates: {
        Row: {
          audience_size: number | null
          category: string | null
          commission_rate: number | null
          commission_rate_boleto: number | null
          commission_rate_pix: number | null
          created_at: string
          email: string | null
          id: string
          last_contact: string | null
          name: string
          notes: string | null
          phone: string | null
          social_media: string | null
          stage: string
          website: string | null
        }
        Insert: {
          audience_size?: number | null
          category?: string | null
          commission_rate?: number | null
          commission_rate_boleto?: number | null
          commission_rate_pix?: number | null
          created_at?: string
          email?: string | null
          id: string
          last_contact?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          social_media?: string | null
          stage: string
          website?: string | null
        }
        Update: {
          audience_size?: number | null
          category?: string | null
          commission_rate?: number | null
          commission_rate_boleto?: number | null
          commission_rate_pix?: number | null
          created_at?: string
          email?: string | null
          id?: string
          last_contact?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          social_media?: string | null
          stage?: string
          website?: string | null
        }
        Relationships: []
      }
      big_plan_pillars: {
        Row: {
          color: string
          created_at: string
          description: string | null
          icon: string
          id: number
          name: string
          sort_order: number
        }
        Insert: {
          color?: string
          created_at?: string
          description?: string | null
          icon?: string
          id?: number
          name: string
          sort_order?: number
        }
        Update: {
          color?: string
          created_at?: string
          description?: string | null
          icon?: string
          id?: number
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      challenge_schedule: {
        Row: {
          carousels: number | null
          created_at: string
          focus_theme: string | null
          id: string
          lives: number | null
          reels: number | null
          stories_daily: boolean | null
          week_number: number
          youtube_videos: number | null
        }
        Insert: {
          carousels?: number | null
          created_at?: string
          focus_theme?: string | null
          id?: string
          lives?: number | null
          reels?: number | null
          stories_daily?: boolean | null
          week_number: number
          youtube_videos?: number | null
        }
        Update: {
          carousels?: number | null
          created_at?: string
          focus_theme?: string | null
          id?: string
          lives?: number | null
          reels?: number | null
          stories_daily?: boolean | null
          week_number?: number
          youtube_videos?: number | null
        }
        Relationships: []
      }
      custom_habits: {
        Row: {
          completed: boolean | null
          completed_days: number | null
          created_at: string
          id: number
          pillar_ids: number[] | null
          progress: number | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_days?: number | null
          created_at?: string
          id?: number
          pillar_ids?: number[] | null
          progress?: number | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed?: boolean | null
          completed_days?: number | null
          created_at?: string
          id?: number
          pillar_ids?: number[] | null
          progress?: number | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      daily_goal_completions: {
        Row: {
          audience_completed: boolean | null
          authority_completed: boolean | null
          completion_timestamp: string | null
          created_at: string
          goal_date: string
          id: string
          offer_completed: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          audience_completed?: boolean | null
          authority_completed?: boolean | null
          completion_timestamp?: string | null
          created_at?: string
          goal_date: string
          id?: string
          offer_completed?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          audience_completed?: boolean | null
          authority_completed?: boolean | null
          completion_timestamp?: string | null
          created_at?: string
          goal_date?: string
          id?: string
          offer_completed?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_goals: {
        Row: {
          audience_description: string | null
          audience_reference: string | null
          audience_task: string
          authority_description: string | null
          authority_reference: string | null
          authority_task: string
          created_at: string
          goal_date: string
          id: string
          offer_description: string | null
          offer_reference: string | null
          offer_task: string
          updated_at: string
          user_id: string
        }
        Insert: {
          audience_description?: string | null
          audience_reference?: string | null
          audience_task: string
          authority_description?: string | null
          authority_reference?: string | null
          authority_task: string
          created_at?: string
          goal_date: string
          id?: string
          offer_description?: string | null
          offer_reference?: string | null
          offer_task: string
          updated_at?: string
          user_id: string
        }
        Update: {
          audience_description?: string | null
          audience_reference?: string | null
          audience_task?: string
          authority_description?: string | null
          authority_reference?: string | null
          authority_task?: string
          created_at?: string
          goal_date?: string
          id?: string
          offer_description?: string | null
          offer_reference?: string | null
          offer_task?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_texts: {
        Row: {
          created_at: string
          date: string
          id: number
          text: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: number
          text: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: number
          text?: string
        }
        Relationships: []
      }
      default_habit_completions: {
        Row: {
          completed: boolean | null
          completed_days: number | null
          created_at: string
          habit_id: number
          id: number
          progress: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_days?: number | null
          created_at?: string
          habit_id: number
          id?: number
          progress?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed?: boolean | null
          completed_days?: number | null
          created_at?: string
          habit_id?: number
          id?: number
          progress?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      default_habit_pillars: {
        Row: {
          created_at: string
          habit_id: number
          id: number
          pillar_id: number
          user_id: string
        }
        Insert: {
          created_at?: string
          habit_id: number
          id?: number
          pillar_id: number
          user_id: string
        }
        Update: {
          created_at?: string
          habit_id?: number
          id?: number
          pillar_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "default_habit_pillars_pillar_id_fkey"
            columns: ["pillar_id"]
            isOneToOne: false
            referencedRelation: "big_plan_pillars"
            referencedColumns: ["id"]
          },
        ]
      }
      habit_daily_completions: {
        Row: {
          completion_date: string
          created_at: string
          habit_id: number
          id: number
          is_custom_habit: boolean
          user_id: string
        }
        Insert: {
          completion_date?: string
          created_at?: string
          habit_id: number
          id?: number
          is_custom_habit?: boolean
          user_id: string
        }
        Update: {
          completion_date?: string
          created_at?: string
          habit_id?: number
          id?: number
          is_custom_habit?: boolean
          user_id?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          category: string | null
          company_name: string | null
          contact_name: string | null
          created_at: string
          domain: string
          email: string | null
          id: string
          last_contact: string | null
          notes: string | null
          phone: string | null
          stage: string
          value: number | null
        }
        Insert: {
          category?: string | null
          company_name?: string | null
          contact_name?: string | null
          created_at?: string
          domain: string
          email?: string | null
          id: string
          last_contact?: string | null
          notes?: string | null
          phone?: string | null
          stage: string
          value?: number | null
        }
        Update: {
          category?: string | null
          company_name?: string | null
          contact_name?: string | null
          created_at?: string
          domain?: string
          email?: string | null
          id?: string
          last_contact?: string | null
          notes?: string | null
          phone?: string | null
          stage?: string
          value?: number | null
        }
        Relationships: []
      }
      pillar_annual_goals: {
        Row: {
          created_at: string
          current_value: number | null
          description: string | null
          id: number
          notes: string | null
          pillar_id: number
          progress_percentage: number | null
          target_value: number | null
          title: string
          updated_at: string
          user_id: string
          year: number
        }
        Insert: {
          created_at?: string
          current_value?: number | null
          description?: string | null
          id?: number
          notes?: string | null
          pillar_id: number
          progress_percentage?: number | null
          target_value?: number | null
          title: string
          updated_at?: string
          user_id: string
          year: number
        }
        Update: {
          created_at?: string
          current_value?: number | null
          description?: string | null
          id?: number
          notes?: string | null
          pillar_id?: number
          progress_percentage?: number | null
          target_value?: number | null
          title?: string
          updated_at?: string
          user_id?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "pillar_annual_goals_pillar_id_fkey"
            columns: ["pillar_id"]
            isOneToOne: false
            referencedRelation: "big_plan_pillars"
            referencedColumns: ["id"]
          },
        ]
      }
      pillar_quarterly_goals: {
        Row: {
          created_at: string
          current_value: number | null
          description: string | null
          id: number
          notes: string | null
          pillar_id: number
          progress_percentage: number | null
          quarter: number
          reflections: string | null
          target_value: number | null
          title: string
          updated_at: string
          user_id: string
          year: number
        }
        Insert: {
          created_at?: string
          current_value?: number | null
          description?: string | null
          id?: number
          notes?: string | null
          pillar_id: number
          progress_percentage?: number | null
          quarter: number
          reflections?: string | null
          target_value?: number | null
          title: string
          updated_at?: string
          user_id: string
          year: number
        }
        Update: {
          created_at?: string
          current_value?: number | null
          description?: string | null
          id?: number
          notes?: string | null
          pillar_id?: number
          progress_percentage?: number | null
          quarter?: number
          reflections?: string | null
          target_value?: number | null
          title?: string
          updated_at?: string
          user_id?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "pillar_quarterly_goals_pillar_id_fkey"
            columns: ["pillar_id"]
            isOneToOne: false
            referencedRelation: "big_plan_pillars"
            referencedColumns: ["id"]
          },
        ]
      }
      thirteen_week_cycles: {
        Row: {
          created_at: string
          cycle_number: number
          description: string | null
          end_date: string
          final_reflection: string | null
          id: number
          main_focus: string
          start_date: string
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          cycle_number: number
          description?: string | null
          end_date: string
          final_reflection?: string | null
          id?: number
          main_focus: string
          start_date: string
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          cycle_number?: number
          description?: string | null
          end_date?: string
          final_reflection?: string | null
          id?: number
          main_focus?: string
          start_date?: string
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: number
          id: number
          unlocked_at: string
          user_id: string
        }
        Insert: {
          achievement_id: number
          id?: number
          unlocked_at?: string
          user_id: string
        }
        Update: {
          achievement_id?: number
          id?: number
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_books: {
        Row: {
          author: string
          created_at: string
          description: string | null
          id: number
          pdf_url: string | null
          title: string
          week_start: string
        }
        Insert: {
          author: string
          created_at?: string
          description?: string | null
          id?: number
          pdf_url?: string | null
          title: string
          week_start: string
        }
        Update: {
          author?: string
          created_at?: string
          description?: string | null
          id?: number
          pdf_url?: string | null
          title?: string
          week_start?: string
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
    Enums: {},
  },
} as const
