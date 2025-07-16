// app/layout.tsx

export const dynamic = 'force-dynamic'

import React from "react"
import "./globals.css"
import Header from "../components/Header"
import Footer from "../components/Footer"
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
  title: "Talentify",
  description: "パチンコ店と演者をつなぐマッチングプラットフォーム",
  icons: {
    icon: "/favicon.png?v=2",
  },
}

export default async function RootLayout({
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
          {children}
          <Footer />
        </SupabaseProvider>
      </body>
    </html>
  )
}
