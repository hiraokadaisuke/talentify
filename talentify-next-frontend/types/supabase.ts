export {}

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
      stores: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          store_name: string
          id: string
          updated_at: string | null
          user_id: string
          is_setup_complete: boolean | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          store_name: string
          id?: string
          updated_at?: string | null
          user_id: string
          is_setup_complete?: boolean | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          store_name?: string
          id?: string
          updated_at?: string | null
          user_id?: string
          is_setup_complete?: boolean | null
        }
        Relationships: []
      }
      companies: {
        Row: {
          id: string
          user_id: string
          company_name: string
          address: string | null
          tel: string | null
          description: string | null
          avatar_url: string | null
          display_name: string | null
          is_setup_complete: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          company_name: string
          address?: string | null
          tel?: string | null
          description?: string | null
          avatar_url?: string | null
          display_name?: string | null
          is_setup_complete?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          company_name?: string
          address?: string | null
          tel?: string | null
          description?: string | null
          avatar_url?: string | null
          display_name?: string | null
          is_setup_complete?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
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
      talents: {
        Row: {
          area: string | null
          availability: string | null
          avatar_url: string | null
          bio: string | null
          bio_hobby: string | null
          bio_certifications: string | null
          bio_others: string | null
          genre: string | null
          notes: string | null
          achievements: string | null
          created_at: string | null
          stage_name: string | null
          birthdate: string | null
          gender: string | null
          residence: string | null
          birthplace: string | null
          height_cm: number | null
          agency_name: string | null
          experience_years: number | null
          twitter_url: string | null
          instagram_url: string | null
          youtube_url: string | null
          social_tiktok: string | null
          photos: string[] | null
          media_appearance: string | null
          id: string
          location: string | null
          name: string
          profile: string | null
          rate: number | null
          skills: string[] | null
          social_links: string[] | null
          is_setup_complete: boolean | null
        }
        Insert: {
          area?: string | null
          availability?: string | null
          avatar_url?: string | null
          bio?: string | null
          bio_hobby?: string | null
          bio_certifications?: string | null
          bio_others?: string | null
          genre?: string | null
          notes?: string | null
          achievements?: string | null
          created_at?: string | null
          stage_name?: string | null
          birthdate?: string | null
          gender?: string | null
          residence?: string | null
          birthplace?: string | null
          height_cm?: number | null
          agency_name?: string | null
          experience_years?: number | null
          twitter_url?: string | null
          instagram_url?: string | null
          youtube_url?: string | null
          social_tiktok?: string | null
          photos?: string[] | null
          media_appearance?: string | null
          id?: string
          location?: string | null
          name: string
          profile?: string | null
          rate?: number | null
          skills?: string[] | null
          social_links?: string[] | null
          is_setup_complete?: boolean | null
        }
        Update: {
          area?: string | null
          availability?: string | null
          avatar_url?: string | null
          bio?: string | null
          bio_hobby?: string | null
          bio_certifications?: string | null
          bio_others?: string | null
          genre?: string | null
          notes?: string | null
          achievements?: string | null
          created_at?: string | null
          stage_name?: string | null
          birthdate?: string | null
          gender?: string | null
          residence?: string | null
          birthplace?: string | null
          height_cm?: number | null
          agency_name?: string | null
          experience_years?: number | null
          twitter_url?: string | null
          instagram_url?: string | null
          youtube_url?: string | null
          social_tiktok?: string | null
          photos?: string[] | null
          media_appearance?: string | null
          id?: string
          location?: string | null
          name?: string
          profile?: string | null
          rate?: number | null
          skills?: string[] | null
          social_links?: string[] | null
          is_setup_complete?: boolean | null
        }
        Relationships: []
      },
      payments: {
        Row: {
          id: string
          offer_id: string | null
          amount: number | null
          status: string | null
          invoice_url: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          offer_id?: string | null
          amount?: number | null
          status?: string | null
          invoice_url?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          offer_id?: string | null
          amount?: number | null
          status?: string | null
          invoice_url?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      ,
      invoices: {
        Row: {
          id: string
          offer_id: string
          store_id: string
          talent_id: string
          amount: number
          invoice_url: string | null
          created_at: string | null
          updated_at: string | null
          status: Enums<'invoice_status'>
          due_date: string | null
          invoice_number: string | null
        }
        Insert: {
          id?: string
          offer_id: string
          store_id: string
          talent_id: string
          amount: number
          invoice_url?: string | null
          created_at?: string | null
          updated_at?: string | null
          status?: Enums<'invoice_status'>
          due_date?: string | null
          invoice_number?: string | null
        }
        Update: {
          id?: string
          offer_id?: string
          store_id?: string
          talent_id?: string
          amount?: number
          invoice_url?: string | null
          created_at?: string | null
          updated_at?: string | null
          status?: Enums<'invoice_status'>
          due_date?: string | null
          invoice_number?: string | null
        }
        Relationships: []
      }

      messages: {
        Row: {
          id: string
          sender_id: string
          content: string | null
          payload: Json | null
          topic: string | null
          event: string | null
          private: boolean | null
          extension: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          sender_id: string
          content?: string | null
          payload?: Json | null
          topic?: string | null
          event?: string | null
          private?: boolean | null
          extension?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          sender_id?: string
          content?: string | null
          payload?: Json | null
          topic?: string | null
          event?: string | null
          private?: boolean | null
          extension?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ,
      notifications: {
        Row: {
          id: string
          user_id: string
          offer_id: string | null
          type:
            | 'offer'
            | 'offer_accepted'
            | 'schedule_fixed'
            | 'contract_uploaded'
            | 'contract_checked'
            | 'invoice_submitted'
            | 'payment_completed'
            | 'message'
          title: string
          body: string | null
          is_read: boolean
          created_at: string
          read_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          offer_id?: string | null
          type:
            | 'offer'
            | 'offer_accepted'
            | 'schedule_fixed'
            | 'contract_uploaded'
            | 'contract_checked'
            | 'invoice_submitted'
            | 'payment_completed'
            | 'message'
          title: string
          body?: string | null
          is_read?: boolean
          created_at?: string
          read_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          offer_id?: string | null
          type?: string
          title?: string
          body?: string | null
          is_read?: boolean
          created_at?: string
          read_at?: string | null
        }
        Relationships: []
      }
      offers: {
        Row: {
          id: string
          user_id: string
          store_id: string | null
          talent_id: string
          message: string
          visit_date: string
          time_range: string | null
          contract_url: string | null
          notes: string | null
          agreed: boolean | null
          reward: number | null
          invoice_date: string | null
          invoice_amount: number | null
          bank_name: string | null
          bank_branch: string | null
          bank_account_number: string | null
          bank_account_holder: string | null
          invoice_submitted: boolean | null
          created_at: string | null
          status: string | null
        }
        Insert: {
          id?: string
          user_id: string
          store_id?: string | null
          talent_id: string
          message: string
          visit_date: string
          time_range?: string | null
          contract_url?: string | null
          notes?: string | null
          agreed?: boolean | null
          reward?: number | null
          invoice_date?: string | null
          invoice_amount?: number | null
          bank_name?: string | null
          bank_branch?: string | null
          bank_account_number?: string | null
          bank_account_holder?: string | null
          invoice_submitted?: boolean | null
          created_at?: string | null
          status?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          store_id?: string | null
          talent_id?: string
          message?: string
          visit_date?: string
          time_range?: string | null
          contract_url?: string | null
          notes?: string | null
          agreed?: boolean | null
          reward?: number | null
          invoice_date?: string | null
          invoice_amount?: number | null
          bank_name?: string | null
          bank_branch?: string | null
          bank_account_number?: string | null
          bank_account_holder?: string | null
          invoice_submitted?: boolean | null
          created_at?: string | null
          status?: string | null
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
      invoice_status: 'draft' | 'submitted' | 'approved' | 'rejected'
      notification_type:
        | 'offer'
        | 'offer_accepted'
        | 'schedule_fixed'
        | 'contract_uploaded'
        | 'contract_checked'
        | 'invoice_submitted'
        | 'payment_completed'
        | 'message'
      offer_status: 'pending' | 'accepted' | 'rejected'
      payment_status: 'pending' | 'paid' | 'cancelled'
      status_type: 'draft' | 'pending' | 'approved' | 'rejected' | 'completed'
      visit_status: 'scheduled' | 'confirmed' | 'visited'
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
      invoice_status: ['draft', 'submitted', 'approved', 'rejected'],
      notification_type: [
        'offer',
        'offer_accepted',
        'schedule_fixed',
        'contract_uploaded',
        'contract_checked',
        'invoice_submitted',
        'payment_completed',
        'message'
      ],
      offer_status: ['pending', 'accepted', 'rejected'],
      payment_status: ['pending', 'paid', 'cancelled'],
      status_type: ['draft', 'pending', 'approved', 'rejected', 'completed'],
      visit_status: ['scheduled', 'confirmed', 'visited']
    },
  },
} as const
