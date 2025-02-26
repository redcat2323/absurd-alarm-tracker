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
      custom_habits: {
        Row: {
          completed: boolean | null
          completed_days: number | null
          created_at: string
          id: number
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
          progress?: number | null
          title?: string
          updated_at?: string | null
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
