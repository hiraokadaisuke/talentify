import React from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { createClient } from "@/lib/supabase/server";
import { SupabaseProvider } from "@/lib/supabase/provider";
import { getDisplayName } from "@/lib/getDisplayName";

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
  const displayName = await getDisplayName("store");

  return (
    <html lang="ja">
      <body className="font-sans antialiased bg-white text-black">
        <SupabaseProvider session={session}>
          <Header sidebarRole="store" displayName={displayName} />
          <div className="flex h-[calc(100vh-64px)] pt-16">
            <Sidebar role="store" collapsible />
            <main className="flex-1 overflow-y-auto p-6 transition-[margin,width]">{children}</main>
          </div>
        </SupabaseProvider>
      </body>
    </html>
  );
}
