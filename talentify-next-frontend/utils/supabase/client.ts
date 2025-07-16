// utils/supabase/client.ts
'use client'

import { createBrowserClient } from '@supabase/ssr'

export const dynamic = 'force-dynamic'

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )