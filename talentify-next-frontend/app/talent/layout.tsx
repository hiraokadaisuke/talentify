import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { SupabaseProvider } from '@/lib/supabase/provider'
import TalentRouteShell from '@/components/talent/TalentRouteShell'

export const metadata = {
  title: 'Talentify | タレント',
}

export default async function TalentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  return (
    <html lang="ja" className="h-full">
      <body className="font-sans antialiased bg-[#f1f5f9] text-black min-h-screen flex flex-col">
        <SupabaseProvider session={session}>
          <TalentRouteShell>{children}</TalentRouteShell>
        </SupabaseProvider>
      </body>
    </html>
  )
}
