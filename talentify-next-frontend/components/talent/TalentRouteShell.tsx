'use client'

import { usePathname } from 'next/navigation'
import Header from '@/components/Header'
import SiteFooter from '@/components/SiteFooter'

export default function TalentRouteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isTalentLanding = pathname === '/talent'

  if (isTalentLanding) {
    return (
      <>
        <Header />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </>
    )
  }

  return (
    <>
      <Header sidebarRole="talent" />
      <div className="flex flex-1 pt-16">
        <main className="flex-1 overflow-y-auto bg-[#f1f5f9] p-6">{children}</main>
      </div>
    </>
  )
}
