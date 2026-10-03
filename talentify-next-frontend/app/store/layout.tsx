import React from "react";

export const metadata = {
  title: "来店ナビ | 店舗",
};

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 pt-16">
      <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto bg-[#F8FAFC] px-3 py-4 sm:p-5 lg:px-8 lg:py-7 xl:px-10">
        {children}
      </main>
    </div>
  );
}
