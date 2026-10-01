import React from "react";

export const metadata = {
  title: "Talentify | 店舗",
};

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 pt-16">
      <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto bg-[#f1f5f9] p-0 sm:p-4 lg:p-6">
        {children}
      </main>
    </div>
  );
}
