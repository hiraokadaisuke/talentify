import React from 'react'
import TalentRouteShell from '@/components/talent/TalentRouteShell'

export const metadata = {
  title: 'Talentify | タレント',
}

export default function TalentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <TalentRouteShell>{children}</TalentRouteShell>
}
