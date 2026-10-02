'use client'

import { usePathname } from 'next/navigation'

export default function TalentRouteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isTalentLanding = pathname === '/talent'

  if (isTalentLanding) {
    return <div className="flex-1">{children}</div>
  }

  return (
    <div className="flex min-h-full flex-1 pt-16">
      <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto bg-[#F8FAFC] px-3 py-4 sm:p-5 lg:p-6">
        {children}
      </main>
    </div>
  )
}
