import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, CalendarDays, Search, UserRound } from 'lucide-react'
import { getPublicPerformers } from '@/lib/publicDiscovery'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: '演者から探す｜来店ナビ',
  description: '演者ごとの今後の来店予定を探せる来店ナビの演者検索ページです。',
}

type SearchParams = {
  q?: string
}

function formatDate(dateKey: string) {
  const date = new Date(`${dateKey}T00:00:00+09:00`)
  return new Intl.DateTimeFormat('ja-JP', {
    timeZone: 'Asia/Tokyo',
    month: 'numeric',
    day: 'numeric',
    weekday: 'short',
  }).format(date)
}

export default async function PerformersPage({
  searchParams,
}: {
  searchParams?: SearchParams
}) {
  const performers = await getPublicPerformers()
  const q = searchParams?.q?.trim() ?? ''

  const filtered = performers.filter((performer) => {
    if (!q) return true
    return [performer.name, performer.bio]
      .filter(Boolean)
      .join(' ')
      .toLocaleLowerCase('ja')
      .includes(q.toLocaleLowerCase('ja'))
  })

  return (
    <main className="min-h-screen bg-[#F8FAFC] pt-16 text-slate-950">
      <section className="bg-[#081426] px-4 py-8 text-white sm:px-6 sm:py-10">
        <div className="mx-auto max-w-6xl lg:max-w-[1320px]">
          <p className="text-[10px] font-black tracking-[0.18em] text-[#FFC400]">PERFORMER SEARCH</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">演者から探す</h1>
          <p className="mt-3 max-w-2xl text-sm font-medium leading-7 text-white/60">
            気になる演者が決まっているときに、今後どの店舗へ来るか確認できます。
          </p>

          <form action="/performers" method="get" className="mt-5 flex max-w-2xl gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                name="q"
                defaultValue={q}
                placeholder="演者名で検索"
                className="h-12 w-full rounded-xl border border-white/15 bg-white pl-10 pr-3 text-sm font-bold text-slate-950 outline-none placeholder:text-slate-400 focus:border-orange-300"
              />
            </div>
            <button className="h-12 shrink-0 rounded-xl bg-[#FF5A1F] px-4 text-sm font-black text-white">
              検索
            </button>
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-6xl lg:max-w-[1320px] px-4 py-6 sm:px-6 sm:py-8">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-black tracking-[0.14em] text-[#C2410C]">PERFORMERS</p>
            <h2 className="mt-1 text-xl font-black">{q ? '検索結果' : '公開中の演者'}</h2>
          </div>
          <p className="text-xs font-bold text-slate-400">{filtered.length}人</p>
        </div>

        {filtered.length > 0 ? (
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {filtered.map((performer) => (
              <Link
                key={performer.id}
                href={`/performers/${performer.id}`}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,.05)] transition hover:-translate-y-0.5 hover:border-orange-200"
              >
                <div className="aspect-square bg-slate-100">
                  {performer.avatarUrl ? (
                    <img
                      src={performer.avatarUrl}
                      alt={performer.name}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-slate-300">
                      <UserRound className="h-10 w-10" />
                    </div>
                  )}
                </div>

                <div className="p-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="truncate text-sm font-black text-slate-950 sm:text-base">
                      {performer.name}
                    </h3>
                    <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-[#C2410C]" />
                  </div>
                  <p className="mt-2 text-[10px] font-black text-[#C2410C]">
                    今後の来店 {performer.upcomingEvents.length}件
                  </p>
                  {performer.nextEvent && (
                    <p className="mt-1 truncate text-[11px] font-medium text-slate-500">
                      次回 {formatDate(performer.nextEvent.dateKey)}・{performer.nextEvent.store.name}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-10 text-center">
            <Search className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-3 text-sm font-black text-slate-700">該当する演者が見つかりませんでした</p>
            <Link
              href="/performers"
              className="mt-4 inline-flex min-h-10 items-center rounded-xl bg-[#0B1F3B] px-4 text-xs font-black text-white"
            >
              条件をクリア
            </Link>
          </div>
        )}

        <div className="mt-9 rounded-2xl border border-orange-100 bg-orange-50/60 p-4">
          <p className="text-sm font-black text-slate-900">店舗や地域から探す方がメインです</p>
          <p className="mt-1 text-xs leading-5 text-slate-600">
            今日どこへ行くか探す場合は、地域・店舗から探すと見つけやすくなります。
          </p>
          <div className="mt-3 flex gap-2">
            <Link href="/areas" className="inline-flex min-h-9 items-center rounded-xl bg-[#0B1F3B] px-3 text-xs font-black text-white">
              地域から探す
            </Link>
            <Link href="/stores" className="inline-flex min-h-9 items-center rounded-xl border border-slate-200 bg-white px-3 text-xs font-black text-slate-700">
              店舗から探す
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
