import React from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { SidebarProvider } from "@/components/SidebarProvider";
import SidebarToggle from "@/components/SidebarToggle";
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
    <html lang="ja">
      <body className="font-sans antialiased bg-white text-black">
        <SupabaseProvider session={session}>
          <Header sidebarRole="store" />
          <div className="flex h-[calc(100vh-64px)] pt-16">
            <SidebarProvider>
              <div className="hidden md:block">
                <Sidebar role="store" collapsible />
              </div>
              <div className="hidden md:block">
                <SidebarToggle />
              </div>
              <main className="flex-1 overflow-y-auto p-6 transition-[margin,width]">{children}</main>
            </SidebarProvider>
          </div>
        </SupabaseProvider>
      </body>
    </html>
  );
}
