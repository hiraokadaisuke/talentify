import type { Metadata } from 'next'
import { getPublicEvents } from '@/lib/events/publicEvents'
import EventsBoard, { type EventSearchParams } from '@/components/events/EventsBoard'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: '来店情報｜来店ナビ',
  description: '今日・明日・今週の演者来店予定を、日付や地域から探せる来店ナビの一般向け来店情報ページです。',
}

export default async function Page({ searchParams }: { searchParams?: EventSearchParams }) {
  const events = await getPublicEvents()
  return <EventsBoard events={events} searchParams={searchParams} />
}
