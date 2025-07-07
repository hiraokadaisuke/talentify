export interface Database {
  public: {
    Tables: {
      talents: {
        Row: {
          id: string
          name: string
          email: string
          profile: string
          sns_links: string[]
          area: string
          bio: string
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
        }
        Insert: {
          user_id: string
          talent_id: string
          message: string
          date: string
          created_at?: string // サーバー側で自動生成される場合は optional に
        }
        Update: Partial<{
          user_id: string
          talent_id: string
          message: string
          date: string
          created_at: string
        }>
      }
    }
  }
}
