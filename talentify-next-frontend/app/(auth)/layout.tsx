// app/(auth)/layout.tsx

import React from "react"
import "../globals.css"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { Inter, Noto_Sans_JP } from "next/font/google"
import AuthSession from "@/components/AuthSession" // ✅ こちらを残す

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

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" className={`${inter.variable} ${noto.variable}`}>
      <body className="font-sans antialiased bg-white text-black">
        <AuthSession>
          <Header />
          {children}
          <Footer />
        </AuthSession>
      </body>
    </html>
  )
}
