import React from "react";
import Header from "@/components/Header";
import SiteFooter from "@/components/SiteFooter";
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
      <body className="font-sans antialiased bg-[#f8fafc] text-black min-h-screen flex flex-col">
        <SupabaseProvider session={session}>
          <Header sidebarRole="store" />
          <main className="flex-1 pt-16">
            <div className="role-page-container">
              <div className="role-page-card">{children}</div>
            </div>
          </main>
          <SiteFooter />
        </SupabaseProvider>
      </body>
    </html>
  );
}
