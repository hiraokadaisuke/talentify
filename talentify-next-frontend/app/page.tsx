import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  Building2,
  CalendarDays,
  Clock3,
  LogIn,
  MapPin,
  Search,
  UserRound,
} from 'lucide-react'
import { getPublicEvents, toTokyoDateKey, type PublicEvent } from '@/lib/events/publicEvents'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: '来店ナビ｜パチンコ店の来店情報を探す',
  description:
    '今日・明日・今週の演者来店予定を、日付や地域から探せる来店情報サイト。公開中の来店予定を来店ナビでチェックできます。',
}

function shiftDateKey(dateKey: string, days: number) {
  const [year, month, day] = dateKey.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day + days))
  return date.toISOString().slice(0, 10)
}

function formatDate(dateKey: string, withYear = false) {
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

function EventCard({ event, compact = false }: { event: PublicEvent; compact?: boolean }) {
  return (
    <Link
      href={`/events/${event.slug}`}
      className="group overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,.06)] transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-[0_16px_38px_rgba(255,90,31,.10)]"
    >
      <div className={compact ? 'grid grid-cols-[92px_1fr]' : 'grid grid-cols-[112px_1fr] sm:grid-cols-[150px_1fr]'}>
        <div className={compact ? 'relative min-h-[118px] bg-slate-100' : 'relative min-h-[150px] bg-slate-100 sm:min-h-[178px]'}>
          {event.talent.avatarUrl ? (
            <Image
              src={event.talent.avatarUrl}
              alt={event.talent.name}
              fill
              sizes={compact ? '92px' : '(max-width: 640px) 112px, 150px'}
              className="object-cover"
            />
          ) : (
            <div className="grid h-full min-h-[118px] place-items-center text-slate-300">
              <UserRound className="h-9 w-9" />
            </div>
          )}
        </div>
        <div className={compact ? 'min-w-0 p-3.5' : 'min-w-0 p-4 sm:p-5'}>
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-black text-[#C2410C]">{formatDate(event.dateKey)}</p>
            <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-[#C2410C]" />
          </div>
          <h3 className={compact ? 'mt-2 truncate text-base font-black text-slate-950' : 'mt-2 truncate text-lg font-black text-slate-950 sm:text-xl'}>
            {event.talent.name}
          </h3>
          <p className="mt-1 truncate text-sm font-bold text-slate-700">{event.store.name}</p>
          <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-medium text-slate-500">
            <span className="inline-flex items-center gap-1">
              <Clock3 className="h-3.5 w-3.5" />
              {timeLabel(event)}
            </span>
            {(event.store.prefecture || event.store.address) && (
              <span className="inline-flex min-w-0 items-center gap-1">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{event.store.prefecture || event.store.address}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

export default async function HomePage() {
  const allEvents = await getPublicEvents()
  const today = toTokyoDateKey(new Date())
  const tomorrow = shiftDateKey(today, 1)
  const weekEnd = shiftDateKey(today, 6)

  const activeEvents = allEvents.filter(
    (event) =>
      !['canceled', 'ended'].includes(event.publicationStatus) &&
      event.dateKey >= today
  )

  const todayEvents = activeEvents.filter((event) => event.dateKey === today)
  const tomorrowEvents = activeEvents.filter((event) => event.dateKey === tomorrow)
  const weekEvents = activeEvents.filter(
    (event) => event.dateKey >= today && event.dateKey <= weekEnd
  )
  const upcomingEvents = activeEvents.filter((event) => event.dateKey > today).slice(0, 6)
  const prefectures = Array.from(
    new Set(activeEvents.map((event) => event.store.prefecture).filter(Boolean) as string[])
  ).sort((a, b) => a.localeCompare(b, 'ja'))

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#F8FAFC] text-slate-950">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#081426]/96 text-white shadow-[0_8px_30px_rgba(0,0,0,.18)] backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-[1500px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-10">
          <Link href="/" className="shrink-0">
            <img src="/brand/raiten-navi-logo.svg" alt="来店ナビ" className="h-8 w-auto sm:h-9" />
          </Link>

          <nav className="flex items-center gap-1 sm:gap-2">
            <Link href="/areas" className="rounded-lg px-2.5 py-2 text-xs font-black text-white/80 transition hover:bg-white/8 hover:text-white sm:px-3 sm:text-sm">
              地域
            </Link>
            <Link href="/stores" className="rounded-lg px-2.5 py-2 text-xs font-black text-white/80 transition hover:bg-white/8 hover:text-white sm:px-3 sm:text-sm">
              店舗
            </Link>
            <Link href="/events?view=today" className="rounded-lg px-2.5 py-2 text-xs font-black text-white/70 transition hover:bg-white/8 hover:text-white sm:px-3 sm:text-sm">
              今日
            </Link>
          </nav>

          <Link
            href="/service"
            className="hidden h-9 items-center rounded-full border border-white/15 px-3.5 text-xs font-bold text-white/70 transition hover:bg-white/8 hover:text-white sm:inline-flex"
          >
            店舗・演者の方
          </Link>
        </div>
      </header>

      <section
        className="relative overflow-hidden px-4 pb-11 pt-[96px] text-white sm:px-6 sm:pb-14 sm:pt-[112px]"
        style={{
          background:
            'radial-gradient(circle at 78% 16%, rgba(255,196,0,.17), transparent 24%), radial-gradient(circle at 20% 80%, rgba(255,90,31,.17), transparent 28%), linear-gradient(135deg, #081426 0%, #0B1F3B 58%, #07111f 100%)',
        }}
      >
        <div className="mx-auto w-full max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-[10px] font-black tracking-[0.2em] text-[#FFC400] sm:text-xs">RAITEN INFORMATION</p>
            <h1 className="mt-4 text-[42px] font-black leading-[1.05] tracking-tight sm:text-[64px] lg:text-[76px]">
              今日、
              <br />
              どこ行く？
            </h1>
            <p className="mt-5 max-w-2xl text-sm font-medium leading-7 text-white/65 sm:text-base sm:leading-8">
              地域や店舗から、今日・近日の来店予定をチェック。
              行きたいエリアやよく行く店舗を起点に、公開中の来店情報を探せます。
            </p>
          </div>

          <div className="mt-8 grid max-w-2xl grid-cols-3 gap-2">
            {[
              { href: '/events?view=today', label: '今日', count: todayEvents.length },
              { href: '/events?view=tomorrow', label: '明日', count: tomorrowEvents.length },
              { href: '/events?view=week', label: '今週', count: weekEvents.length },
            ].map((item, index) => (
              <Link
                key={item.label}
                href={item.href}
                className={
                  index === 0
                    ? 'rounded-2xl bg-white px-3 py-3.5 text-center text-[#081426] shadow-lg'
                    : 'rounded-2xl border border-white/12 bg-white/[0.055] px-3 py-3.5 text-center text-white backdrop-blur transition hover:bg-white/10'
                }
              >
                <p className="text-sm font-black">{item.label}</p>
                <p className={index === 0 ? 'mt-1 text-xs font-bold text-slate-500' : 'mt-1 text-xs font-bold text-white/45'}>
                  {item.count}件
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-7 sm:px-6 sm:py-9">
        <section>
          <div>
            <p className="text-[10px] font-black tracking-[0.14em] text-[#C2410C]">FIND YOUR STORE</p>
            <h2 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">どこへ行くかから探す</h2>
            <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
              来店ナビでは、地域・店舗から探すのがメインです。
            </p>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <Link
              href="/areas"
              className="group rounded-[24px] border border-orange-100 bg-gradient-to-br from-orange-50 to-white p-5 shadow-[0_10px_30px_rgba(255,90,31,.08)] transition hover:-translate-y-0.5 hover:border-orange-200"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#FF5A1F] text-white shadow-sm">
                  <MapPin className="h-5 w-5" />
                </span>
                <ArrowRight className="h-5 w-5 text-orange-300 transition group-hover:translate-x-0.5 group-hover:text-[#C2410C]" />
              </div>
              <p className="mt-5 text-[10px] font-black tracking-[0.14em] text-[#C2410C]">AREA</p>
              <h3 className="mt-1 text-2xl font-black text-slate-950">地域から探す</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                行きたい都道府県から、来店予定がある店舗をまとめて確認。
              </p>
            </Link>

            <Link
              href="/stores"
              className="group rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,.05)] transition hover:-translate-y-0.5 hover:border-orange-200"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#0B1F3B] text-white shadow-sm">
                  <Building2 className="h-5 w-5" />
                </span>
                <ArrowRight className="h-5 w-5 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-[#C2410C]" />
              </div>
              <p className="mt-5 text-[10px] font-black tracking-[0.14em] text-slate-400">STORE</p>
              <h3 className="mt-1 text-2xl font-black text-slate-950">店舗から探す</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                よく行く店舗や気になる店舗から、今後の来店予定をチェック。
              </p>
            </Link>
          </div>

          <div className="mt-3 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-600">
                <UserRound className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-black text-slate-900">演者から探す</p>
                <p className="mt-0.5 text-xs leading-5 text-slate-500">好きな演者の来店予定を追いたい方はこちら。</p>
              </div>
            </div>
            <Link href="/performers" className="inline-flex items-center gap-1 text-xs font-black text-[#C2410C]">
              演者一覧を見る <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {prefectures.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {prefectures.slice(0, 8).map((prefecture) => (
                <Link
                  key={prefecture}
                  href={`/stores?prefecture=${encodeURIComponent(prefecture)}`}
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-[#C2410C]"
                >
                  <MapPin className="h-3.5 w-3.5" />
                  {prefecture}
                </Link>
              ))}
            </div>
          )}
        </section>

        <div className="mt-9 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-black tracking-[0.16em] text-[#C2410C]">TODAY</p>
            <h2 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">今日の来店</h2>
          </div>
          <Link href="/events?view=today" className="inline-flex items-center gap-1 text-xs font-black text-slate-500 transition hover:text-[#C2410C]">
            すべて見る
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {todayEvents.length > 0 ? (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {todayEvents.slice(0, 6).map((event) => (
              <EventCard event={event} key={event.id} />
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-[24px] border border-dashed border-slate-300 bg-white px-5 py-9 text-center">
            <CalendarDays className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-3 text-sm font-black text-slate-700">今日の公開中の来店情報はありません</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">明日以降の来店予定もチェックできます。</p>
            <Link
              href="/events?view=week"
              className="mt-4 inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-[#0B1F3B] px-4 text-xs font-black text-white"
            >
              今週の来店を見る
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}

        {upcomingEvents.length > 0 && (
          <section className="mt-11">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-black tracking-[0.16em] text-slate-400">UPCOMING</p>
                <h2 className="mt-1 text-2xl font-black tracking-tight">近日の来店</h2>
              </div>
              <Link href="/events?view=week" className="inline-flex items-center gap-1 text-xs font-black text-slate-500 transition hover:text-[#C2410C]">
                一覧を見る
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="mt-4 grid gap-3 lg:grid-cols-3">
              {upcomingEvents.map((event) => (
                <EventCard event={event} compact key={event.id} />
              ))}
            </div>
          </section>
        )}

        <section className="mt-12 overflow-hidden rounded-[28px] bg-[#081426] px-5 py-7 text-white sm:px-7 sm:py-8">
          <div className="grid gap-6 sm:grid-cols-[1fr_auto] sm:items-center">
            <div>
              <p className="text-[10px] font-black tracking-[0.16em] text-[#FFC400]">FOR STORES & PERFORMERS</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight">店舗・演者の方はこちら</h2>
              <p className="mt-2 max-w-2xl text-sm font-medium leading-7 text-white/55">
                演者検索、オファー、案件管理、見積・請求、確定した来店情報の公開まで。業務で来店ナビを利用する方はこちらから。
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/service"
                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-[#FF3B2E] via-[#FF8A00] to-[#FFC400] px-4 text-sm font-black text-[#081426]"
              >
                <Building2 className="h-4 w-4" />
                サービスを見る
              </Link>
              <Link
                href="/login"
                className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] px-4 text-sm font-black text-white"
              >
                <LogIn className="h-4 w-4" />
                ログイン
              </Link>
            </div>
          </div>
        </section>
      </section>
    </main>
  )
}
