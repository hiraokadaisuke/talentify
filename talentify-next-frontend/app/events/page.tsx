import Link from 'next/link'
import { CalendarDays, Clock3, MapPin, Search, UserRound } from 'lucide-react'
import { getPublicEvents, toTokyoDateKey, type PublicEvent } from '@/lib/events/publicEvents'

export const revalidate = 60

type SearchParams = {
  view?: string
  prefecture?: string
}

function shiftDateKey(dateKey: string, days: number) {
  const [year, month, day] = dateKey.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day + days))
  return date.toISOString().slice(0, 10)
}

function dateParts(dateKey: string) {
  const date = new Date(`${dateKey}T00:00:00+09:00`)
  return {
    monthDay: new Intl.DateTimeFormat('ja-JP', {
      timeZone: 'Asia/Tokyo',
      month: 'numeric',
      day: 'numeric',
    }).format(date),
    weekday: new Intl.DateTimeFormat('ja-JP', {
      timeZone: 'Asia/Tokyo',
      weekday: 'short',
    }).format(date),
  }
}

function buildEventsHref(view: string, prefecture?: string) {
  const params = new URLSearchParams()
  params.set('view', view)
  if (prefecture) params.set('prefecture', prefecture)
  return `/events?${params.toString()}`
}

function EventCard({ event }: { event: PublicEvent }) {
  const date = dateParts(event.dateKey)
  const time =
    event.startTime && event.endTime
      ? `${event.startTime}〜${event.endTime}`
      : event.startTime
        ? `${event.startTime}〜`
        : '時間非公開'

  return (
    <Link
      href={`/events/${event.slug}`}
      className="group grid grid-cols-[64px_72px_minmax(0,1fr)] items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_8px_24px_rgba(15,23,42,.05)] transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-[0_14px_34px_rgba(255,90,31,.10)] sm:grid-cols-[76px_88px_minmax(0,1fr)_auto] sm:gap-4 sm:p-4"
    >
      <div className="text-center">
        <p className="text-xl font-black tracking-tight text-slate-950 sm:text-2xl">{date.monthDay}</p>
        <p className="mt-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-[#C2410C]">
          {date.weekday}
        </p>
      </div>

      <div className="h-[72px] w-[72px] overflow-hidden rounded-2xl bg-slate-100 sm:h-[88px] sm:w-[88px]">
        {event.talent.avatarUrl ? (
          <img
            src={event.talent.avatarUrl}
            alt={event.talent.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-slate-300">
            <UserRound className="h-8 w-8" />
          </div>
        )}
      </div>

      <div className="min-w-0">
        <p className="truncate text-base font-black text-slate-950 sm:text-lg">{event.talent.name}</p>
        <p className="mt-1 truncate text-sm font-bold text-slate-700">{event.store.name}</p>
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-medium text-slate-500 sm:text-xs">
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {event.store.prefecture || event.store.address || '店舗情報'}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock3 className="h-3.5 w-3.5" />
            {time}
          </span>
        </div>
      </div>

      <span className="col-start-3 mt-1 inline-flex justify-self-start rounded-full bg-orange-50 px-3 py-1.5 text-[10px] font-black text-[#C2410C] group-hover:bg-orange-100 sm:col-start-auto sm:mt-0 sm:justify-self-end">
        詳細を見る →
      </span>
    </Link>
  )
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams?: SearchParams
}) {
  const allEvents = await getPublicEvents()
  const today = toTokyoDateKey(new Date())
  const tomorrow = shiftDateKey(today, 1)
  const weekEnd = shiftDateKey(today, 6)

  const requestedView = searchParams?.view
  const view = ['today', 'tomorrow', 'week'].includes(requestedView || '')
    ? (requestedView as 'today' | 'tomorrow' | 'week')
    : 'today'
  const prefecture = searchParams?.prefecture || ''

  const activeEvents = allEvents.filter(
    (event) => !['canceled', 'ended'].includes(event.publicationStatus)
  )

  const prefectures = Array.from(
    new Set(activeEvents.map((event) => event.store.prefecture).filter(Boolean) as string[])
  ).sort((a, b) => a.localeCompare(b, 'ja'))

  const byPeriod = activeEvents.filter((event) => {
    if (view === 'today') return event.dateKey === today
    if (view === 'tomorrow') return event.dateKey === tomorrow
    return event.dateKey >= today && event.dateKey <= weekEnd
  })

  const visibleEvents = prefecture
    ? byPeriod.filter((event) => event.store.prefecture === prefecture)
    : byPeriod

  const fallbackEvents =
    visibleEvents.length === 0
      ? activeEvents
          .filter(
            (event) =>
              event.dateKey >= today &&
              (!prefecture || event.store.prefecture === prefecture)
          )
          .slice(0, 6)
      : []

  const heading =
    view === 'today' ? '今日の来店' : view === 'tomorrow' ? '明日の来店' : '今週の来店'

  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-16 pt-16 text-slate-950">
      <section
        className="relative overflow-hidden px-4 py-10 text-white sm:px-6 sm:py-14"
        style={{
          background:
            'radial-gradient(circle at 80% 20%, rgba(255,196,0,.16), transparent 26%), radial-gradient(circle at 20% 80%, rgba(255,90,31,.18), transparent 30%), #081426',
        }}
      >
        <div className="mx-auto w-full max-w-5xl">
          <p className="text-[10px] font-black tracking-[0.2em] text-[#FFC400] sm:text-xs">
            RAITEN INFORMATION
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">今日は、誰が来る？</h1>
          <p className="mt-3 max-w-2xl text-sm font-medium leading-7 text-white/60 sm:text-base">
            来店ナビで公開されている、演者の来店予定を日付と地域から探せます。
          </p>

          <div className="mt-7 grid max-w-xl grid-cols-3 gap-2">
            {[
              ['today', '今日'],
              ['tomorrow', '明日'],
              ['week', '今週'],
            ].map(([value, label]) => {
              const active = view === value
              return (
                <Link
                  key={value}
                  href={buildEventsHref(value, prefecture || undefined)}
                  className={
                    active
                      ? 'inline-flex min-h-11 items-center justify-center rounded-xl bg-white px-3 text-sm font-black text-[#081426]'
                      : 'inline-flex min-h-11 items-center justify-center rounded-xl border border-white/15 bg-white/5 px-3 text-sm font-black text-white/70 transition hover:bg-white/10 hover:text-white'
                  }
                >
                  {label}
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        <form className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center">
          <input type="hidden" name="view" value={view} />
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0 text-[#C2410C]" />
            <select
              name="prefecture"
              defaultValue={prefecture}
              className="h-10 min-w-0 flex-1 bg-transparent text-sm font-bold text-slate-700 outline-none"
              aria-label="都道府県"
            >
              <option value="">すべての地域</option>
              {prefectures.map((item) => (
                <option value={item} key={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl bg-[#0B1F3B] px-4 text-xs font-black text-white"
          >
            <Search className="h-3.5 w-3.5" />
            絞り込む
          </button>
        </form>

        <div className="mt-7 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-black tracking-[0.16em] text-[#C2410C]">
              PUBLIC EVENTS
            </p>
            <h2 className="mt-1 text-2xl font-black tracking-tight">{heading}</h2>
          </div>
          <div className="inline-flex items-center gap-1 text-xs font-bold text-slate-400">
            <CalendarDays className="h-4 w-4" />
            {visibleEvents.length}件
          </div>
        </div>

        {visibleEvents.length > 0 ? (
          <div className="mt-4 space-y-3">
            {visibleEvents.map((event) => (
              <EventCard event={event} key={event.id} />
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-9 text-center">
            <CalendarDays className="mx-auto h-7 w-7 text-slate-300" />
            <p className="mt-3 text-sm font-black text-slate-700">該当する来店情報はありません</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              新しい来店情報が公開されると、ここに表示されます。
            </p>
          </div>
        )}

        {fallbackEvents.length > 0 && (
          <div className="mt-10">
            <p className="text-[10px] font-black tracking-[0.16em] text-slate-400">UPCOMING</p>
            <h2 className="mt-1 text-xl font-black">今後の公開済み来店</h2>
            <div className="mt-4 space-y-3">
              {fallbackEvents.map((event) => (
                <EventCard event={event} key={`upcoming-${event.id}`} />
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  )
}
