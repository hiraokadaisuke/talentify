import React from 'react'

export const metadata = {
  title: '来店ナビ | 演者',
}

export default function TalentsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-full flex-1 pt-16">
      <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto bg-[#f8fafc]">
        {children}
      </main>
    </div>
  )
}
