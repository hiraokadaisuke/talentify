// app/dashboard/layout.tsx

import React from "react"
import Header from "@/components/Header"
import Sidebar from "@/components/Sidebar"
import Footer from "@/components/Footer"
import { Inter, Noto_Sans_JP } from "next/font/google"
import { createClient } from "@/lib/supabase/server"
import { SupabaseProvider } from "@/utils/supabase/provider"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap", // ✅ 追加！
})

const noto = Noto_Sans_JP({
  subsets: ["latin"],
  variable: "--font-noto",
  display: "swap", // ✅ 追加！
})

export const metadata = {
  title: "Talentify | ダッシュボード",
  description: "Talentify のタレント用管理画面",
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  return (
    <html lang="ja" className={`${inter.variable} ${noto.variable}`}>
      <body className="font-sans antialiased bg-white text-black">
        <SupabaseProvider session={session}>
          <Header />
          <div className="flex min-h-screen">
            <aside className="w-64 border-r p-4 bg-gray-50">
              <Sidebar />
            </aside>
            <main className="flex-1 p-6">{children}</main>
          </div>
          <Footer />
        </SupabaseProvider>
      </body>
    </html>
  )
}
