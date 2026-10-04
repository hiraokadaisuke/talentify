import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Building2, CalendarDays, MapPin, Search, UserRound } from 'lucide-react'
import { getPublicStores } from '@/lib/publicDiscovery'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: '店舗から探す｜来店ナビ',
  description: '店舗名や地域から、パチンコ店の今後の来店予定を探せる来店ナビの店舗検索ページです。',
}

type SearchParams = {
  q?: string
  prefecture?: string
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

export default async function StoresPage({
  searchParams,
}: {
  searchParams?: SearchParams
}) {
  const stores = await getPublicStores()
  const q = searchParams?.q?.trim() ?? ''
  const prefecture = searchParams?.prefecture?.trim() ?? ''

  const prefectures = Array.from(
    new Set(stores.map((store) => store.prefecture).filter(Boolean) as string[]),
  ).sort((a, b) => a.localeCompare(b, 'ja'))

  const filtered = stores.filter((store) => {
    if (prefecture && store.prefecture !== prefecture) return false
    if (!q) return true
    const haystack = [store.name, store.prefecture, store.address].filter(Boolean).join(' ')
    return haystack.toLocaleLowerCase('ja').includes(q.toLocaleLowerCase('ja'))
  })

  return (
    <main className="min-h-screen bg-[#F8FAFC] pt-16 text-slate-950">
      <section className="relative overflow-hidden bg-[#081426] px-4 py-8 text-white sm:px-6 sm:py-10">
        <Image src="/lp/hero/hero-bg.webp" alt="" fill priority quality={65} sizes="100vw" className="object-cover object-center opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#081426] via-[#081426]/88 to-[#081426]/48" />
        <div className="relative mx-auto max-w-6xl lg:max-w-[1320px]">
          <p className="text-[10px] font-black tracking-[0.18em] text-[#FFC400]">STORE SEARCH</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">店舗から探す</h1>
          <p className="mt-3 max-w-2xl text-sm font-medium leading-7 text-white/72">
            登録店舗から探せます。来店予定がある店舗は、カード上ですぐ確認できます。
          </p>

          <form action="/stores" method="get" className="mt-5 flex max-w-2xl gap-2">
            {prefecture && <input type="hidden" name="prefecture" value={prefecture} />}
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                name="q"
                defaultValue={q}
                placeholder="店舗名で検索"
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
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Link
            href={q ? `/stores?q=${encodeURIComponent(q)}` : '/stores'}
            className={`shrink-0 rounded-full border px-3 py-2 text-xs font-bold ${
              !prefecture
                ? 'border-[#0B1F3B] bg-[#0B1F3B] text-white'
                : 'border-slate-200 bg-white text-slate-600'
            }`}
          >
            すべて
          </Link>
          {prefectures.map((item) => {
            const params = new URLSearchParams()
            params.set('prefecture', item)
            if (q) params.set('q', q)
            return (
              <Link
                key={item}
                href={`/stores?${params.toString()}`}
                className={`shrink-0 rounded-full border px-3 py-2 text-xs font-bold ${
                  prefecture === item
                    ? 'border-orange-300 bg-orange-50 text-[#C2410C]'
                    : 'border-slate-200 bg-white text-slate-600'
                }`}
              >
                {item}
              </Link>
            )
          })}
        </div>

        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-black tracking-[0.14em] text-[#C2410C]">STORES</p>
            <h2 className="mt-1 text-xl font-black">
              {prefecture || q ? '検索結果' : '店舗一覧'}
            </h2>
          </div>
          <p className="text-xs font-bold text-slate-400">{filtered.length}店舗</p>
        </div>

        {filtered.length > 0 ? (
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((store) => (
              <Link
                key={store.id}
                href={`/stores/${store.id}`}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,.05)] transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-[0_14px_34px_rgba(255,90,31,.10)]"
              >
                <div className="grid grid-cols-[86px_minmax(0,1fr)] gap-3 p-3.5 sm:grid-cols-[104px_minmax(0,1fr)] sm:p-4">
                  <div className="relative h-[86px] overflow-hidden rounded-xl bg-slate-100 sm:h-[104px]">
                    {store.avatarUrl ? (
                      <img
                        src={store.avatarUrl}
                        alt={store.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="grid h-full w-full place-items-center text-slate-300">
                        <Building2 className="h-8 w-8" />
                      </div>
                    )}
                    {store.upcomingEvents.length > 0 && (
                      <span className="absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded-full bg-[#FF5A1F] px-2 py-1 text-[9px] font-black text-white shadow-[0_6px_16px_rgba(255,90,31,.22)]">
                        <CalendarDays className="h-3 w-3" />
                        来店予定あり
                      </span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="line-clamp-2 text-base font-black text-slate-950 sm:text-lg">
                        {store.name}
                      </h3>
                      <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-[#C2410C]" />
                    </div>

                    <p className="mt-1 flex items-center gap-1 text-xs font-medium text-slate-500">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">
                        {store.prefecture || store.address || '地域情報未設定'}
                      </span>
                    </p>

                    {store.nextEvent ? (
                      <div className="mt-3 flex items-center gap-2">
                        <span className="rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-black text-[#C2410C]">
                          来店予定 {store.upcomingEvents.length}件
                        </span>
                        <span className="truncate text-[11px] font-bold text-slate-500">
                          次回 {formatDate(store.nextEvent.dateKey)}
                        </span>
                      </div>
                    ) : (
                      <p className="mt-3 text-[10px] font-bold text-slate-400">
                        現在、公開中の来店予定なし
                      </p>
                    )}
                  </div>
                </div>

                {store.nextEvent && (
                  <div className="flex items-center gap-2 border-t border-slate-100 bg-slate-50/70 px-3.5 py-2.5 sm:px-4">
                    <CalendarDays className="h-3.5 w-3.5 text-[#C2410C]" />
                    <span className="text-[11px] font-bold text-slate-500">次の来店</span>
                    <span className="ml-auto inline-flex min-w-0 items-center gap-1.5 text-xs font-black text-slate-800">
                      {store.nextEvent.talent.avatarUrl ? (
                        <img
                          src={store.nextEvent.talent.avatarUrl}
                          alt=""
                          className="h-6 w-6 rounded-full object-cover"
                        />
                      ) : (
                        <span className="grid h-6 w-6 place-items-center rounded-full bg-white text-slate-400">
                          <UserRound className="h-3.5 w-3.5" />
                        </span>
                      )}
                      <span className="truncate">{store.nextEvent.talent.name}</span>
                    </span>
                  </div>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-10 text-center">
            <Search className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-3 text-sm font-black text-slate-700">該当する店舗が見つかりませんでした</p>
            <Link
              href="/stores"
              className="mt-4 inline-flex min-h-10 items-center rounded-xl bg-[#0B1F3B] px-4 text-xs font-black text-white"
            >
              条件をクリア
            </Link>
          </div>
        )}

        <div className="mt-9 rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-sm font-black text-slate-900">地域から絞り込みたい場合</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            都道府県から店舗を探すこともできます。
          </p>
          <Link href="/areas" className="mt-3 inline-flex items-center gap-1 text-xs font-black text-[#C2410C]">
            地域から探す <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>
    </main>
  )
}
