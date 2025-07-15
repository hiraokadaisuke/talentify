export interface Database {
  public: {
    Tables: {
      talents: {
        Row: {
          id: string
          name: string
          stage_name: string
          birthdate: string
          gender: string
          residence: string
          birthplace: string
          height_cm: number
          agency_name: string
          email: string
          profile: string
          sns_links: string[]
          social_x: string
          social_instagram: string
          social_youtube: string
          social_tiktok: string
          photos: string[]
          area: string
          bio: string
          bio_hobby: string
          bio_certifications: string
          bio_others: string
          media_appearance: string
          skills: string[]
          experience_years: number
          avatar_url: string
          location: string
          rate: number
          availability: string
        }
        Insert: Omit<Database['public']['Tables']['talents']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['talents']['Row']>
      }

      // ✅ ここに追加
      offers: {
        Row: {
          id: string
          user_id: string
          talent_id: string
          message: string
          date: string
          created_at: string
          status: string
        }
        Insert: {
          user_id: string
          talent_id: string
          message: string
          date: string
          created_at?: string // サーバー側で自動生成される場合は optional に
          status?: string
        }
        Update: Partial<{
          user_id: string
          talent_id: string
          message: string
          date: string
          created_at: string
          status: string
        }>
      }

      stores: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          display_name: string
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name: string
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: Partial<{
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          display_name: string
          id: string
          updated_at: string | null
          user_id: string
        }>
      }

      messages: {
        Row: {
          id: string
          sender_id: string
          receiver_id: string
          text: string
          created_at: string | null
        }
        Insert: {
          id?: string
          sender_id: string
          receiver_id: string
          text: string
          created_at?: string | null
        }
        Update: Partial<{
          id: string
          sender_id: string
          receiver_id: string
          text: string
          created_at: string | null
        }>
      }

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
        Update: Partial<{
          id: string
          offer_id: string | null
          amount: number | null
          status: string | null
          invoice_url: string | null
          created_at: string | null
        }>
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
        Update: Partial<{
          created_at: string | null
          date: string
          description: string | null
          id: string
          updated_at: string | null
          user_id: string
        }>
      }
    }
  }
}
