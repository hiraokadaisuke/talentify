// lib/supabase/server.ts
export const runtime = 'nodejs' //

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase-types'

/**
 * Next.jsのサーバーコンポーネントやAPIルートで
 * 認証クッキー付きSupabaseクライアントを取得する関数
 */
export async function createClient() {
  // Next.jsのcookies()はasyncなのでawaitが必要
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,      // Supabase URL（環境変数）
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, // Supabase匿名キー（環境変数）
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
}
