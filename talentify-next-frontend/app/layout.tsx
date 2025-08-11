// app/layout.tsx

import React from "react";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

export const metadata = {
  title: "Talentify",
  description: "パチンコ店と演者をつなぐマッチングプラットフォーム",
  icons: {
    icon: "/favicon.png?v=2",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="font-sans antialiased bg-white text-black">
        <TooltipProvider delayDuration={200} disableHoverableContent>
          <Header />
          <Toaster />
          {children}
          <Footer />
        </TooltipProvider>
      </body>
    </html>
  );
}
