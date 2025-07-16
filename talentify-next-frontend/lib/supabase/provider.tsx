// lib/supabase/provider.tsx
'use client'

import { createBrowserClient } from '@supabase/ssr'
import { useState, useEffect } from 'react'

export function SupabaseProvider({
  children,
  session,
}: {
  children: React.ReactNode
  session: any
}) {
  const [supabase] = useState(() =>
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  )

  useEffect(() => {
    if (session) {
      supabase.auth.setSession(session)
    }
  }, [session, supabase])

  return <>{children}</>
}
