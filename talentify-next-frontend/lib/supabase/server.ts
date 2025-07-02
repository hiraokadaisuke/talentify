import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/types/supabase' // ←ここ直す

export function createClient() {
  return createServerComponentClient<Database>({
    cookies,
  })
}
