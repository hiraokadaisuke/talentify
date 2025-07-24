'use client'

import { useState, useEffect } from 'react'
import { createClient as createBrowserSupabaseClient } from './client'

export function SupabaseProvider({
  children,
  session,
}: {
  children: React.ReactNode
  session: any
}) {
  const [supabase] = useState(() => createBrowserSupabaseClient())

  useEffect(() => {
    if (session) {
      supabase.auth.setSession(session)
    }
  }, [session, supabase])

  return <>{children}</>
}
