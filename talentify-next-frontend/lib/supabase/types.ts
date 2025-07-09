// lib/supabase/types.ts
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          role: 'performer' | 'store' | null
          // 必要に応じて他のカラムも追記
        }
      }
    }
  }
}
