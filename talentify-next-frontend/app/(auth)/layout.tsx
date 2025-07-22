// app/(auth)/layout.tsx

export const dynamic = "force-dynamic";

import React from "react";
import "../globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
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
    <html lang="ja">
      <body className="font-sans antialiased bg-white text-black">
        <SupabaseProvider session={session}>
          <Header />
          {children}
          <Footer />
        </SupabaseProvider>
      </body>
    </html>
  );
}
