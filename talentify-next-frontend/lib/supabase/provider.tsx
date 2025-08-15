'use client'

import { useState, useEffect } from 'react'
import { createClient as createBrowserSupabaseClient } from './client'

// DO NOT fetch names/ids on the client. Use resolveActorContext() in layouts.

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

  if (!session) {
    return <>{children}</>
  }

  return <>{children}</>
}
