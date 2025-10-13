'use client'

import dynamic from 'next/dynamic'

const ScheduleCalendar = dynamic(() => import('./ScheduleCalendar'), {
  ssr: false,
  loading: () => (
    <main className="mx-auto w-full max-w-6xl space-y-4 p-4">
      <p className="text-sm text-muted-foreground">カレンダーを読み込んでいます…</p>
    </main>
  ),
})

export default function TalentSchedulePage() {
  return <ScheduleCalendar />
}
