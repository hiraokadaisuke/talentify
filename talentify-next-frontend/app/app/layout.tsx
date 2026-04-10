import React from 'react'
import { redirect } from 'next/navigation'
import Header from '@/components/Header'
import { createClient } from '@/lib/supabase/server'
import { SupabaseProvider } from '@/lib/supabase/provider'
import { getUserRoleInfo } from '@/lib/getUserRole'

export const metadata = {
  title: 'Talentify | アプリ',
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login?redirectedFrom=/app')
  }

  const { role } = await getUserRoleInfo(supabase, session.user.id)
  const sidebarRole = role === 'store' || role === 'talent' ? role : undefined

  return (
    <SupabaseProvider session={session}>
      <div className="min-h-screen bg-[#f1f5f9] text-black flex flex-col">
        <Header sidebarRole={sidebarRole} />
        <main className="flex-1 overflow-y-auto bg-[#f1f5f9] p-6 pt-20">{children}</main>
      </div>
    </SupabaseProvider>
  )
}
