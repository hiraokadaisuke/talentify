// app/layout.tsx

import React from "react";
import "./globals.css";
import Header from "../components/Header";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { createClient } from "@/lib/supabase/server";
import { SupabaseProvider } from "@/lib/supabase/provider";

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
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return (
    <html lang="ja">
      <body className="font-sans antialiased bg-white text-black">
        <SupabaseProvider session={session}>
          <TooltipProvider delayDuration={200} disableHoverableContent>
            <Header />
            <Toaster />
            {children}
          </TooltipProvider>
        </SupabaseProvider>
      </body>
    </html>
  );
}
