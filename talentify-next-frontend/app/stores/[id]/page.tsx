import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowRight, Building2, CalendarDays, Clock3, MapPin, UserRound } from 'lucide-react'
import { getPublicStoreById } from '@/lib/publicDiscovery'
import type { PublicEvent } from '@/lib/events/publicEvents'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: { id: string }
}

function formatDate(dateKey: string, withYear = true) {
  const date = new Date(`${dateKey}T00:00:00+09:00`)
  return new Intl.DateTimeFormat('ja-JP', {
    timeZone: 'Asia/Tokyo',
    ...(withYear ? { year: 'numeric' as const } : {}),
    month: 'numeric',
    day: 'numeric',
    weekday: 'short',
  }).format(date)
}

function timeLabel(event: PublicEvent) {
  if (event.startTime && event.endTime) return `${event.startTime}〜${event.endTime}`
  if (event.startTime) return `${event.startTime}〜`
  return '時間非公開'
}

function EventRow({ event }: { event: PublicEvent }) {
  return (
    <Link
      href={`/events/${event.slug}`}
      className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_6px_20px_rgba(15,23,42,.04)] transition hover:border-orange-200 hover:shadow-[0_10px_28px_rgba(255,90,31,.08)]"
    >
      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-100">
        {event.talent.avatarUrl ? (
          <img src={event.talent.avatarUrl} alt={event.talent.name} className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full w-full place-items-center text-slate-300">
            <UserRound className="h-6 w-6" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-black text-[#C2410C]">{formatDate(event.dateKey)}</p>
        <p className="mt-0.5 truncate text-sm font-black text-slate-950">{event.talent.name}</p>
        <p className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-slate-500">
          <Clock3 className="h-3.5 w-3.5" />
          {timeLabel(event)}
        </p>
      </div>
      <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-[#C2410C]" />
    </Link>
  )
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const store = await getPublicStoreById(params.id)
  if (!store) return { title: '店舗情報｜来店ナビ' }

  return {
    title: `${store.name}の来店予定｜来店ナビ`,
    description: `${store.name}の今後の演者来店予定を確認できます。`,
  }
}

export default async function StoreDetailPage({ params }: PageProps) {
  const store = await getPublicStoreById(params.id)
  if (!store) notFound()

  return (
    <main className="min-h-screen bg-[#F8FAFC] pt-16 text-slate-950">
      <section className="bg-[#081426] px-4 py-7 text-white sm:px-6 sm:py-9">
        <div className="mx-auto max-w-5xl lg:max-w-[1200px]">
          <Link href="/stores" className="inline-flex items-center gap-1.5 text-xs font-bold text-white/55 hover:text-white">
            <ArrowLeft className="h-3.5 w-3.5" />
            店舗一覧へ
          </Link>

          <div className="mt-5 flex items-start gap-4">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-white/10 sm:h-24 sm:w-24">
              {store.avatarUrl ? (
                <img src={store.avatarUrl} alt={store.name} className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full w-full place-items-center text-white/30">
                  <Building2 className="h-8 w-8" />
                </div>
              )}
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-black tracking-[0.16em] text-[#FFC400]">STORE</p>
              <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">{store.name}</h1>
              <p className="mt-2 flex items-start gap-1.5 text-xs font-medium leading-5 text-white/55 sm:text-sm">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>{[store.prefecture, store.address].filter(Boolean).join(' ') || '地域情報未設定'}</span>
              </p>
            </div>
          </div>

          <div className="mt-5 grid max-w-md grid-cols-2 gap-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-3">
              <p className="text-[10px] font-bold text-white/45">今後の来店予定</p>
              <p className="mt-1 text-2xl font-black">{store.upcomingEvents.length}<span className="ml-1 text-xs">件</span></p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-3">
              <p className="text-[10px] font-bold text-white/45">公開済み来店履歴</p>
              <p className="mt-1 text-2xl font-black">{store.pastEvents.length}<span className="ml-1 text-xs">件</span></p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl lg:max-w-[1200px] px-4 py-6 sm:px-6 sm:py-8">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-black tracking-[0.14em] text-[#C2410C]">UPCOMING</p>
            <h2 className="mt-1 text-2xl font-black tracking-tight">今後の来店予定</h2>
          </div>
          <Link href="/events?view=week" className="inline-flex items-center gap-1 text-xs font-black text-slate-500 hover:text-[#C2410C]">
            来店情報一覧 <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {store.upcomingEvents.length > 0 ? (
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {store.upcomingEvents.map((event) => <EventRow key={event.id} event={event} />)}
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-9 text-center">
            <CalendarDays className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-3 text-sm font-black text-slate-700">現在公開中の来店予定はありません</p>
          </div>
        )}

        {store.pastEvents.length > 0 && (
          <section className="mt-10">
            <div>
              <p className="text-[10px] font-black tracking-[0.14em] text-slate-400">HISTORY</p>
              <h2 className="mt-1 text-xl font-black">過去の来店履歴</h2>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                来店ナビ上で公開された来店情報です。
              </p>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {store.pastEvents.slice(0, 12).map((event) => <EventRow key={event.id} event={event} />)}
            </div>
          </section>
        )}
      </section>
    </main>
  )
}
