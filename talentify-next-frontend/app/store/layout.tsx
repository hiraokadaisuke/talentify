import React from "react";
import Header from "@/components/Header";
import { createClient } from "@/lib/supabase/server";
import { SupabaseProvider } from "@/lib/supabase/provider";

export const metadata = {
  title: "Talentify | 店舗",
};

export default async function StoreLayout({
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
          <Header sidebarRole="store" />
          <div className="flex flex-1 pt-16">
            <main className="flex-1 overflow-y-auto p-6">{children}</main>
          </div>
        </SupabaseProvider>
      </body>
    </html>
  );
}
