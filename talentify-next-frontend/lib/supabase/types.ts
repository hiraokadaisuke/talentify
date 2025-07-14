// lib/supabase/types.ts
export type Database = {
  public: {
    Tables: {
      stores: {
        Row: {
          id: string
          user_id: string
          role: 'store'
        }
      }
      talents: {
        Row: {
          id: string
          user_id: string
          role: 'talent'
        }
      }
      companies: {
        Row: {
          id: string
          user_id: string
          role: 'company'
        }
      }
    }
  }
}
