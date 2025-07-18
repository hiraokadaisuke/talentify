import React from 'react'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { Inter, Noto_Sans_JP } from 'next/font/google'
import { createClient } from '@/lib/supabase/server'
import { SupabaseProvider } from '@/lib/supabase/provider'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })
const noto = Noto_Sans_JP({ subsets: ['latin'], variable: '--font-noto', display: 'swap' })

export const metadata = {
  title: 'Talentify | 店舗',
}

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  return (
    <html lang="ja" className={`${inter.variable} ${noto.variable}`}>
      <body className="font-sans antialiased bg-white text-black">
        <SupabaseProvider session={session}>
          <Header sidebarRole="store" />
          <div className="flex h-[calc(100vh-64px)] pt-16">
            <aside className="hidden md:block">
              <Sidebar role="store" collapsible />
            </aside>
            <main className="flex-1 overflow-y-auto p-6">{children}</main>
          </div>
        </SupabaseProvider>
      </body>
    </html>
  )
}
