// lib/supabase/server.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/types/supabase'

export function createClient() {
  return createRouteHandlerClient<Database>({ cookies })
}
