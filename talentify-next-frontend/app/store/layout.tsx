import React from 'react'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import Footer from '@/components/Footer'
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
          <div className="flex min-h-screen">
            <aside className="hidden md:block">
              <Sidebar role="store" collapsible />
            </aside>
            <div className="flex flex-1 flex-col">
              <Header sidebarRole="store" />
              <main className="flex-1 p-6">{children}</main>
              <Footer />
            </div>
          </div>
        </SupabaseProvider>
      </body>
    </html>
  )
}
