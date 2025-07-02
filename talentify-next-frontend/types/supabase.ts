// types/supabase.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

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
        Insert: Omit<
          Database['public']['Tables']['talents']['Row'],
          'id'
        >
        Update: Partial<
          Database['public']['Tables']['talents']['Row']
        >
      }
    }
  }
}
