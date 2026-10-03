import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  ExternalLink,
  MapPin,
  Store,
  UserRound,
} from 'lucide-react'
import { FaInstagram, FaTiktok, FaXTwitter, FaYoutube } from 'react-icons/fa6'
import { getPublicEventBySlug, getPublicEvents } from '@/lib/events/publicEvents'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: { slug: string }
}

function formatDate(dateKey: string) {
  const date = new Date(`${dateKey}T00:00:00+09:00`)
  return new Intl.DateTimeFormat('ja-JP', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  }).format(date)
}

function normalizeSocialUrl(value: string | null, baseUrl: string) {
  if (!value) return null
  const trimmed = value.trim()
  if (!trimmed) return null
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `${baseUrl}${trimmed.replace(/^@/, '')}`
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const event = await getPublicEventBySlug(params.slug)
  if (!event) {
    return {
      title: '来店情報｜来店ナビ',
    }
  }

  const date = formatDate(event.dateKey)
  const title = `${event.talent.name}｜${date} ${event.store.name} 来店情報｜来店ナビ`
  const description = `${date}、${event.store.name}に${event.talent.name}さんが来店予定。来店ナビで公開されている来店情報です。`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      images: event.talent.avatarUrl ? [event.talent.avatarUrl] : undefined,
    },
  }
}

export default async function EventDetailPage({ params }: PageProps) {
  const [event, allEvents] = await Promise.all([
    getPublicEventBySlug(params.slug),
    getPublicEvents(),
  ])

  if (!event) notFound()

  const isCanceled = event.publicationStatus === 'canceled'
  const isEnded = event.publicationStatus === 'ended'
  const dateLabel = formatDate(event.dateKey)
  const timeLabel =
    event.startTime && event.endTime
      ? `${event.startTime}〜${event.endTime}`
      : event.startTime
        ? `${event.startTime}〜`
        : '時間非公開'

  const twitterUrl = normalizeSocialUrl(event.talent.twitterUrl, 'https://x.com/')
  const instagramUrl = normalizeSocialUrl(event.talent.instagramUrl, 'https://instagram.com/')
  const youtubeUrl = normalizeSocialUrl(event.talent.youtubeUrl, 'https://youtube.com/@')
  const tiktokUrl = normalizeSocialUrl(event.talent.tiktokUrl, 'https://tiktok.com/@')

  const related = allEvents
    .filter(
      (item) =>
        item.id !== event.id &&
        item.talent.id === event.talent.id &&
        !['canceled', 'ended'].includes(item.publicationStatus) &&
        item.dateKey >= event.dateKey
    )
    .slice(0, 4)

  const startDate =
    event.showTime && event.startTime
      ? `${event.dateKey}T${event.startTime}:00+09:00`
      : event.dateKey
  const endDate =
    event.showTime && event.endTime
      ? `${event.dateKey}T${event.endTime}:00+09:00`
      : undefined

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: `${event.talent.name} 来店予定`,
    startDate,
    ...(endDate ? { endDate } : {}),
    eventStatus: isCanceled
      ? 'https://schema.org/EventCancelled'
      : 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    performer: {
      '@type': 'Person',
      name: event.talent.name,
      ...(event.talent.avatarUrl ? { image: event.talent.avatarUrl } : {}),
    },
    location: {
      '@type': 'Place',
      name: event.store.name,
      ...(event.store.address
        ? {
            address: {
              '@type': 'PostalAddress',
              streetAddress: event.store.address,
              addressRegion: event.store.prefecture || undefined,
              addressCountry: 'JP',
            },
          }
        : {}),
    },
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-16 pt-16 text-slate-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />

      <section
        className="relative overflow-hidden px-4 py-7 text-white sm:px-6 sm:py-9"
        style={{
          background:
            'radial-gradient(circle at 80% 15%, rgba(255,196,0,.15), transparent 25%), #081426',
        }}
      >
        <div className="mx-auto w-full max-w-4xl lg:max-w-[1200px]">
          <Link
            href="/events"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-white/60 transition hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            来店情報一覧へ
          </Link>
          <p className="mt-5 text-[10px] font-black tracking-[0.18em] text-[#FFC400]">
            RAITEN INFORMATION
          </p>
          <p className="mt-2 text-lg font-black text-white/90 sm:text-2xl">{dateLabel}</p>
        </div>
      </section>

      <div className="mx-auto w-full max-w-4xl lg:max-w-[1200px] px-4 py-5 sm:px-6 sm:py-8">
        {isCanceled && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-4">
            <p className="text-sm font-black text-red-800">この来店予定はキャンセルとなりました。</p>
            <p className="mt-1 text-xs leading-5 text-red-700">
              最新の情報は店舗・演者の公式案内もあわせてご確認ください。
            </p>
          </div>
        )}

        {isEnded && (
          <div className="mb-4 rounded-2xl border border-slate-200 bg-white px-4 py-4">
            <p className="text-sm font-black text-slate-700">この来店イベントは終了しました。</p>
          </div>
        )}

        <article className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_16px_44px_rgba(15,23,42,.08)]">
          <div className="grid gap-0 sm:grid-cols-[250px_1fr] lg:grid-cols-[340px_minmax(0,1fr)]">
            <div className="aspect-[4/3] bg-slate-100 sm:aspect-auto sm:min-h-[320px]">
              {event.talent.avatarUrl ? (
                <img
                  src={event.talent.avatarUrl}
                  alt={event.talent.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="grid h-full min-h-[220px] w-full place-items-center text-slate-300">
                  <UserRound className="h-16 w-16" />
                </div>
              )}
            </div>

            <div className="p-5 sm:p-7">
              <span className="inline-flex rounded-full bg-orange-50 px-3 py-1.5 text-[10px] font-black tracking-[0.12em] text-[#C2410C]">
                来店予定
              </span>
              <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">{event.talent.name}</h1>

              <div className="mt-6 space-y-3">
                <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-3.5">
                  <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-[#C2410C]" />
                  <div>
                    <p className="text-[10px] font-black tracking-[0.1em] text-slate-400">DATE</p>
                    <p className="mt-1 text-sm font-black text-slate-800">{dateLabel}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-3.5">
                  <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-[#C2410C]" />
                  <div>
                    <p className="text-[10px] font-black tracking-[0.1em] text-slate-400">TIME</p>
                    <p className="mt-1 text-sm font-black text-slate-800">{timeLabel}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-3.5">
                  <Store className="mt-0.5 h-5 w-5 shrink-0 text-[#C2410C]" />
                  <div className="min-w-0">
                    <p className="text-[10px] font-black tracking-[0.1em] text-slate-400">STORE</p>
                    <p className="mt-1 text-sm font-black text-slate-800">{event.store.name}</p>
                    {(event.store.prefecture || event.store.address) && (
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        {[event.store.prefecture, event.store.address].filter(Boolean).join(' ')}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {event.publicNote && (
                <p className="mt-5 whitespace-pre-wrap rounded-2xl border border-orange-100 bg-orange-50/60 px-4 py-3 text-sm font-medium leading-7 text-slate-700">
                  {event.publicNote}
                </p>
              )}
            </div>
          </div>
        </article>

        <div className="mt-5 grid gap-4 md:grid-cols-2 lg:gap-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-[10px] font-black tracking-[0.14em] text-[#C2410C]">PERFORMER</p>
            <h2 className="mt-1 text-xl font-black">{event.talent.name}</h2>
            {event.talent.bio && (
              <p className="mt-3 line-clamp-4 text-sm font-medium leading-7 text-slate-600">
                {event.talent.bio}
              </p>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href={`/performers/${event.talent.id}`}
                className="inline-flex min-h-9 items-center rounded-full bg-[#0B1F3B] px-3 text-xs font-black text-white"
              >
                この演者の来店予定
              </Link>
              {twitterUrl && (
                <a
                  href={twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-slate-200 px-3 text-xs font-bold text-slate-700"
                >
                  <FaXTwitter className="h-3.5 w-3.5" /> X
                </a>
              )}
              {instagramUrl && (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-slate-200 px-3 text-xs font-bold text-slate-700"
                >
                  <FaInstagram className="h-3.5 w-3.5" /> Instagram
                </a>
              )}
              {youtubeUrl && (
                <a
                  href={youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-slate-200 px-3 text-xs font-bold text-slate-700"
                >
                  <FaYoutube className="h-3.5 w-3.5" /> YouTube
                </a>
              )}
              {tiktokUrl && (
                <a
                  href={tiktokUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-slate-200 px-3 text-xs font-bold text-slate-700"
                >
                  <FaTiktok className="h-3.5 w-3.5" /> TikTok
                </a>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-[10px] font-black tracking-[0.14em] text-[#C2410C]">LOCATION</p>
            <h2 className="mt-1 text-xl font-black">{event.store.name}</h2>
            {(event.store.prefecture || event.store.address) && (
              <p className="mt-3 flex items-start gap-1.5 text-sm font-medium leading-6 text-slate-600">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#C2410C]" />
                {[event.store.prefecture, event.store.address].filter(Boolean).join(' ')}
              </p>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href={`/stores/${event.store.id}`}
                className="inline-flex min-h-10 items-center rounded-xl bg-[#0B1F3B] px-4 text-xs font-black text-white"
              >
                この店舗の来店予定
              </Link>
              {event.store.address && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `${event.store.name} ${event.store.address}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 text-xs font-black text-slate-700"
                >
                  地図で確認
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          </section>
        </div>

        {related.length > 0 && (
          <section className="mt-8">
            <p className="text-[10px] font-black tracking-[0.14em] text-[#C2410C]">UPCOMING</p>
            <h2 className="mt-1 text-xl font-black">{event.talent.name}さんの今後の来店</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <Link
                  href={`/events/${item.slug}`}
                  key={item.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-orange-200"
                >
                  <p className="text-xs font-black text-[#C2410C]">{formatDate(item.dateKey)}</p>
                  <p className="mt-1 truncate text-sm font-black text-slate-900">{item.store.name}</p>
                  <p className="mt-2 text-xs font-medium text-slate-500">
                    {item.startTime && item.endTime
                      ? `${item.startTime}〜${item.endTime}`
                      : '時間非公開'}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="mt-8 text-center">
          <Link
            href="/events"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-700"
          >
            来店情報一覧へ戻る
          </Link>
        </div>
      </div>
    </main>
  )
}
