import React from 'react'

export const metadata = {
  title: '来店ナビ | 演者検索',
}

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-full flex-1 pt-16">
      <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto bg-[#f1f5f9] p-0 sm:p-4 lg:p-6">
        {children}
      </main>
    </div>
  )
}
