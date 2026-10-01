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
      <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto bg-[#f1f5f9] p-0 sm:p-4 lg:p-6">
        {children}
      </main>
    </div>
  )
}
