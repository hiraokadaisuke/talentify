export const runtime = 'nodejs'

import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_KEY

  if (!url || !serviceKey) {
    throw new Error('Supabase environment variables are not set')
  }

  return createClient<Database>(url, serviceKey)
}

export type { Database }
