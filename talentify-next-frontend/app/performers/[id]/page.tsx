import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowRight, CalendarDays, Clock3, MapPin, UserRound } from 'lucide-react'
import { FaInstagram, FaTiktok, FaXTwitter, FaYoutube } from 'react-icons/fa6'
import { getPublicPerformerById } from '@/lib/publicDiscovery'
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
      className="group rounded-2xl border border-slate-200 bg-white p-3.5 shadow-[0_6px_20px_rgba(15,23,42,.04)] transition hover:border-orange-200"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-black text-[#C2410C]">{formatDate(event.dateKey)}</p>
          <h3 className="mt-1 text-sm font-black text-slate-950">{event.store.name}</h3>
        </div>
        <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-[#C2410C]" />
      </div>
      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-medium text-slate-500">
        <span className="inline-flex items-center gap-1">
          <Clock3 className="h-3.5 w-3.5" />
          {timeLabel(event)}
        </span>
        <span className="inline-flex min-w-0 items-center gap-1">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{event.store.prefecture || event.store.address || '地域情報未設定'}</span>
        </span>
      </div>
    </Link>
  )
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const performer = await getPublicPerformerById(params.id)
  if (!performer) return { title: '演者情報｜来店ナビ' }

  return {
    title: `${performer.name}の来店予定｜来店ナビ`,
    description: `${performer.name}の今後の来店予定を確認できます。`,
  }
}

export default async function PerformerDetailPage({ params }: PageProps) {
  const performer = await getPublicPerformerById(params.id)
  if (!performer) notFound()

  const socialLinks = [
    { label: 'X', href: performer.twitterUrl, icon: FaXTwitter },
    { label: 'Instagram', href: performer.instagramUrl, icon: FaInstagram },
    { label: 'YouTube', href: performer.youtubeUrl, icon: FaYoutube },
    { label: 'TikTok', href: performer.tiktokUrl, icon: FaTiktok },
  ].filter((item) => Boolean(item.href))

  return (
    <main className="min-h-screen bg-[#F8FAFC] pt-16 text-slate-950">
      <section className="bg-[#081426] px-4 py-7 text-white sm:px-6 sm:py-9">
        <div className="mx-auto max-w-5xl">
          <Link href="/performers" className="inline-flex items-center gap-1.5 text-xs font-bold text-white/55 hover:text-white">
            <ArrowLeft className="h-3.5 w-3.5" />
            演者一覧へ
          </Link>

          <div className="mt-5 flex items-start gap-4">
            <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-white/10 sm:h-28 sm:w-28">
              {performer.avatarUrl ? (
                <img src={performer.avatarUrl} alt={performer.name} className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full w-full place-items-center text-white/30">
                  <UserRound className="h-9 w-9" />
                </div>
              )}
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-black tracking-[0.16em] text-[#FFC400]">PERFORMER</p>
              <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">{performer.name}</h1>
              {performer.bio && (
                <p className="mt-2 line-clamp-3 max-w-2xl text-xs font-medium leading-6 text-white/55 sm:text-sm">
                  {performer.bio}
                </p>
              )}
              {socialLinks.length > 0 && (
                <div className="mt-3 flex gap-2">
                  {socialLinks.map(({ label, href, icon: Icon }) => (
                    <a
                      key={label}
                      href={href!}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${performer.name}の${label}`}
                      className="grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-white/[0.05] text-sm text-white/80 hover:bg-white/10"
                    >
                      <Icon />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        <div>
          <p className="text-[10px] font-black tracking-[0.14em] text-[#C2410C]">UPCOMING</p>
          <h2 className="mt-1 text-2xl font-black tracking-tight">今後の来店予定</h2>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            {performer.name}さんが今後来店予定の店舗です。
          </p>
        </div>

        {performer.upcomingEvents.length > 0 ? (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {performer.upcomingEvents.map((event) => <EventRow key={event.id} event={event} />)}
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-9 text-center">
            <CalendarDays className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-3 text-sm font-black text-slate-700">現在公開中の来店予定はありません</p>
          </div>
        )}

        {performer.pastEvents.length > 0 && (
          <section className="mt-10">
            <p className="text-[10px] font-black tracking-[0.14em] text-slate-400">HISTORY</p>
            <h2 className="mt-1 text-xl font-black">過去の来店履歴</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {performer.pastEvents.slice(0, 12).map((event) => <EventRow key={event.id} event={event} />)}
            </div>
          </section>
        )}
      </section>
    </main>
  )
}
