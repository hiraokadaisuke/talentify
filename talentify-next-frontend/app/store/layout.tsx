import React from "react"
import Header from "@/components/Header"
import Sidebar from "@/components/Sidebar"
import { createClient } from "@/lib/supabase/server"
import { SupabaseProvider } from "@/lib/supabase/provider"
import { getDisplayName } from "@/lib/getDisplayName"

export const metadata = {
  title: "Talentify | 店舗",
}

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let session = null
  try {
    const supabase = createClient()
    const {
      data: { session: s },
    } = await supabase.auth.getSession()
    session = s
  } catch (e) {
    console.error("StoreLayout session error", e)
  }

  const displayName = await getDisplayName("store")

  return (
    <html lang="ja">
      <body className="font-sans antialiased bg-white text-black">
        <SupabaseProvider session={session}>
          <Header sidebarRole="store" displayName={displayName || "ユーザー"} />
          <div className="flex h-[calc(100vh-64px)] pt-16">
            <Sidebar role="store" collapsible />
            <main className="flex-1 overflow-y-auto p-6 transition-[margin,width]">{children}</main>
          </div>
        </SupabaseProvider>
      </body>
    </html>
  )
}
