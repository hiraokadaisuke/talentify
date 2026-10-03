import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Building2, MapPin } from 'lucide-react'
import { getPublicStores } from '@/lib/publicDiscovery'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: '地域から探す｜来店ナビ',
  description: '地域ごとにパチンコ店の来店予定を探せる来店ナビの地域検索ページです。',
}

export default async function AreasPage() {
  const stores = await getPublicStores()
  const grouped = new Map<string, typeof stores>()

  for (const store of stores) {
    const key = store.prefecture || '地域未設定'
    const current = grouped.get(key) ?? []
    current.push(store)
    grouped.set(key, current)
  }

  const areas = Array.from(grouped.entries()).sort(([a], [b]) => {
    if (a === '地域未設定') return 1
    if (b === '地域未設定') return -1
    return a.localeCompare(b, 'ja')
  })

  return (
    <main className="min-h-screen bg-[#F8FAFC] pt-16 text-slate-950">
      <section className="bg-[#081426] px-4 py-8 text-white sm:px-6 sm:py-10">
        <div className="mx-auto max-w-6xl lg:max-w-[1320px]">
          <p className="text-[10px] font-black tracking-[0.18em] text-[#FFC400]">AREA SEARCH</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">地域から探す</h1>
          <p className="mt-3 max-w-2xl text-sm font-medium leading-7 text-white/60">
            行きたい地域から、来店予定が公開されている店舗を探せます。
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl lg:max-w-[1320px] px-4 py-6 sm:px-6 sm:py-8">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {areas.map(([area, areaStores]) => {
            const upcomingCount = areaStores.reduce(
              (sum, store) => sum + store.upcomingEvents.length,
              0,
            )

            return (
              <Link
                key={area}
                href={
                  area === '地域未設定'
                    ? '/stores'
                    : `/stores?prefecture=${encodeURIComponent(area)}`
                }
                className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,.05)] transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-[0_14px_32px_rgba(255,90,31,.10)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-orange-50 text-[#C2410C]">
                    <MapPin className="h-5 w-5" />
                  </span>
                  <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-[#C2410C]" />
                </div>
                <h2 className="mt-4 text-xl font-black text-slate-950">{area}</h2>
                <div className="mt-2 flex items-center gap-3 text-xs font-bold text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <Building2 className="h-3.5 w-3.5" />
                    {areaStores.length}店舗
                  </span>
                  <span>今後の来店 {upcomingCount}件</span>
                </div>
              </Link>
            )
          })}
        </div>

        {areas.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-10 text-center">
            <MapPin className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-3 text-sm font-black text-slate-700">地域情報はまだありません</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              公開中の来店情報が増えると、地域別に表示されます。
            </p>
          </div>
        )}

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-black text-slate-900">店舗名が分かっている場合</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              店舗一覧から直接検索する方が早く見つけられます。
            </p>
          </div>
          <Link
            href="/stores"
            className="mt-3 inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-[#0B1F3B] px-4 text-xs font-black text-white sm:mt-0"
          >
            店舗から探す
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>
    </main>
  )
}
