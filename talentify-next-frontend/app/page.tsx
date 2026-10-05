import type { Metadata } from 'next'
import { getPublicEvents } from '@/lib/events/publicEvents'
import EventsBoard, { type EventSearchParams } from '@/components/events/EventsBoard'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: '来店ナビ｜パチンコ店の来店情報を探す',
  description:
    '今日・明日・今週の演者来店予定を、日付や地域から探せる来店情報サイト。公開中の来店予定を来店ナビでチェックできます。',
}

export default async function Page({ searchParams }: { searchParams?: EventSearchParams }) {
  const events = await getPublicEvents()
  return <EventsBoard events={events} searchParams={searchParams} />
}
