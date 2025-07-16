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
      companies: {
        Row: {
          address: string | null
          avatar_url: string | null
          company_name: string | null
          created_at: string | null
          description: string | null
          id: string
          is_setup_complete: boolean | null
          tel: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_setup_complete?: boolean | null
          tel?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_setup_complete?: boolean | null
          tel?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }

      messages: {
  Row: {
    id: string
    sender_id: string
    receiver_id: string
    content: string
    created_at: string
  }
  Insert: {
    sender_id: string
    receiver_id: string
    content: string
  }
  Update: {
    content?: string
  }
  Relationships: []
}

      offers: {
        Row: {
          created_at: string | null
          date: string
          id: string
          message: string | null
          talent_id: string | null
          user_id: string | null
          status: string | null;
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          message?: string | null
          talent_id?: string | null
          user_id?: string | null
          status: string | null;
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          message?: string | null
          talent_id?: string | null
          user_id?: string | null
          status: string | null;
        }
        Relationships: [
          {
            foreignKeyName: "offers_talent_id_fkey"
            columns: ["talent_id"]
            isOneToOne: false
            referencedRelation: "talents"
            referencedColumns: ["id"]
          },
        ]
      }
      schedules: {
        Row: {
          created_at: string | null
          date: string
          description: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date: string
          description?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          date?: string
          description?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      stores: {
        Row: {
          avatar_url: string | null
          bio: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string | null
          id: string
          is_setup_complete: boolean | null
          store_address: string | null
          store_name: string | null
          store_prefect: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          is_setup_complete?: boolean | null
          store_address?: string | null
          store_name?: string | null
          store_prefect?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          is_setup_complete?: boolean | null
          store_address?: string | null
          store_name?: string | null
          store_prefect?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      talents: {
        Row: {
          area: string | null
          availability: string | null
          avatar_url: string | null
          bio: string | null
          company_id: string | null
          created_at: string | null
          display_name: string | null
          experience_years: number | null
          id: string
          instagram: string | null
          instagram_url: string | null
          is_setup_complete: boolean | null
          location: string | null
          media_appearance: string | null
          name?: string
          phone: string | null
          profile: string | null
          rate: number | null
          rating: number | null
          skills: string[] | null
          sns_links: Json | null
          social_links: string[] | null
          stage_name: string | null
          twitter: string | null
          twitter_url: string | null
          user_id: string | null
          video_url: string | null
          youtube: string | null
          youtube_url: string | null
        }
        Insert: {
          area?: string | null
          availability?: string | null
          avatar_url?: string | null
          bio?: string | null
          company_id?: string | null
          created_at?: string | null
          display_name?: string | null
          experience_years?: number | null
          id?: string
          instagram?: string | null
          instagram_url?: string | null
          is_setup_complete?: boolean | null
          location?: string | null
          media_appearance?: string | null
          name: string
          phone?: string | null
          profile?: string | null
          rate?: number | null
          rating?: number | null
          skills?: string[] | null
          sns_links?: Json | null
          social_links?: string[] | null
          stage_name?: string | null
          twitter?: string | null
          twitter_url?: string | null
          user_id?: string | null
          video_url?: string | null
          youtube?: string | null
          youtube_url?: string | null
        }
        Update: {
          area?: string | null
          availability?: string | null
          avatar_url?: string | null
          bio?: string | null
          company_id?: string | null
          created_at?: string | null
          display_name?: string | null
          experience_years?: number | null
          id?: string
          instagram?: string | null
          instagram_url?: string | null
          is_setup_complete?: boolean | null
          location?: string | null
          media_appearance?: string | null
          name?: string
          phone?: string | null
          profile?: string | null
          rate?: number | null
          rating?: number | null
          skills?: string[] | null
          sns_links?: Json | null
          social_links?: string[] | null
          stage_name?: string | null
          twitter?: string | null
          twitter_url?: string | null
          user_id?: string | null
          video_url?: string | null
          youtube?: string | null
          youtube_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "talents_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
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

export {}
