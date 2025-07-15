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
    }
  }
}
