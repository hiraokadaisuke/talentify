import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/supabase'

export const createClient = () =>
  createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,       // ✅ セッション永続化
        autoRefreshToken: true,     // ✅ トークン自動更新（任意だが推奨）
      },
    }
  )

export type { Database }
