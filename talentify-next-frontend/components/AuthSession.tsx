import React from "react"
import { createClient } from "@/lib/supabase/server"
import { SupabaseProvider } from "@/utils/supabase/provider"

export default async function AuthSession({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  return <SupabaseProvider session={session}>{children}</SupabaseProvider>
}
