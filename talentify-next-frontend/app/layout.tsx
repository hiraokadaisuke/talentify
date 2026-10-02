// app/layout.tsx

import React from "react";
import "./globals.css";
import Header from "../components/Header";
import SiteFooter from "../components/SiteFooter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

export const metadata = {
  title: "来店ナビ",
  applicationName: "来店ナビ",
  description: "パチンコ店と演者をつなぎ、来店イベントの検索・オファー・案件管理・告知までを支援する来店イベントプラットフォーム",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "来店ナビ",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: "/brand/raiten-navi-icon.svg?v=1",
    shortcut: "/brand/raiten-navi-icon.svg?v=1",
    apple: "/apple-touch-icon.png?v=2",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className="h-full">
      <body className="font-sans antialiased bg-white text-black min-h-screen flex flex-col">
        <TooltipProvider delayDuration={200} disableHoverableContent>
          <Header />
          <div className="flex-1">{children}</div>
          <SiteFooter />
          <Toaster />
        </TooltipProvider>
      </body>
    </html>
  );
}
