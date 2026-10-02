'use client'

import Link from 'next/link'
import { ArrowRight, CalendarDays, Search, Users } from 'lucide-react'

const options = [
  {
    href: '/search/talents',
    eyebrow: 'TALENT SEARCH',
    title: '演者から探す',
    description: '名前・ジャンル・活動エリア・料金目安から、依頼したい演者を探します。',
    icon: Users,
  },
  {
    href: '/search/calendar',
    eyebrow: 'SCHEDULE SEARCH',
    title: '日時から探す',
    description: '希望日を起点に、スケジュールを確認しながら候補の演者を探します。',
    icon: CalendarDays,
  },
]

export default function SearchTopPage() {
  return (
    <main className="mx-auto w-full max-w-5xl space-y-5 py-2 sm:py-4">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,.05)]">
        <div className="flex items-start gap-3 p-5 sm:p-6">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#0B1F3B] text-[#FFC400]">
            <Search className="h-5 w-5" />
          </span>
          <div>
            <p className="text-[11px] font-black tracking-[0.16em] text-[#C2410C]">FIND TALENTS</p>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950">演者を探す</h1>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              演者から探すか、希望日時から探すかを選んでください。
            </p>
          </div>
        </div>
        <div className="h-1 bg-gradient-to-r from-[#FF3B2E] via-[#FF8A00] to-[#FFC400]" />
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        {options.map(option => {
          const Icon = option.icon
          return (
            <Link
              key={option.href}
              href={option.href}
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,.05)] transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-[0_16px_36px_rgba(255,90,31,.10)] sm:p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-orange-50 text-[#FF5A1F]">
                  <Icon className="h-5 w-5" />
                </span>
                <ArrowRight className="h-5 w-5 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-[#FF5A1F]" />
              </div>
              <p className="mt-5 text-[10px] font-black tracking-[0.14em] text-[#C2410C]">{option.eyebrow}</p>
              <h2 className="mt-1 text-xl font-black text-slate-950">{option.title}</h2>
              <p className="mt-2 text-sm leading-7 text-slate-600">{option.description}</p>
            </Link>
          )
        })}
      </div>
    </main>
  )
}
