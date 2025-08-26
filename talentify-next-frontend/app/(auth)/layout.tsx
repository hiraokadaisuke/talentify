// app/(auth)/layout.tsx

export const dynamic = "auto";

import React from "react";
import "../globals.css";
import Header from "@/components/Header";
import { createClient } from "@/lib/supabase/server";
import { SupabaseProvider } from "@/lib/supabase/provider";

export const metadata = {
  title: "Talentify",
  description: "パチンコ店と演者をつなぐマッチングプラットフォーム",
  icons: {
    icon: "/favicon.png?v=2",
  },
};

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return (
    <html lang="ja" className="h-full">
      <body className="font-sans antialiased bg-white text-black min-h-screen flex flex-col">
        <SupabaseProvider session={session}>
          <Header />
          <main className="flex-1">{children}</main>
        </SupabaseProvider>
      </body>
    </html>
  );
}
