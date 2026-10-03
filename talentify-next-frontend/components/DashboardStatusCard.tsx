import Link from 'next/link'
import { CircleCheckBig, Clock3, MessageSquare } from 'lucide-react'

type DashboardStatusCardProps = {
  pending: number
  confirmed: number
  unread: number
  offersLink: string
  messagesLink: string
}

export default function DashboardStatusCard({
  pending,
  confirmed,
  unread,
  offersLink,
  messagesLink,
}: DashboardStatusCardProps) {
  const items = [
    {
      label: '保留中',
      value: pending,
      href: offersLink,
      icon: Clock3,
      tone: 'border-amber-100 bg-amber-50/70 text-amber-700',
    },
    {
      label: '承認済み',
      value: confirmed,
      href: offersLink,
      icon: CircleCheckBig,
      tone: 'border-emerald-100 bg-emerald-50/70 text-emerald-700',
    },
    {
      label: '未読',
      value: unread,
      href: messagesLink,
      icon: MessageSquare,
      tone: 'border-orange-100 bg-orange-50/70 text-[#C2410C]',
    },
  ] as const

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,.05)]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-base font-black text-slate-950">現在の状況</h2>
        <div className="flex items-center gap-3 text-xs font-semibold">
          <Link href={offersLink} className="text-slate-500 hover:text-[#C2410C]">
            オファー
          </Link>
          <Link href={messagesLink} className="text-slate-500 hover:text-[#C2410C]">
            メッセージ
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {items.map(item => {
          const Icon = item.icon
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`rounded-xl border p-2.5 transition hover:shadow-sm ${item.tone}`}
            >
              <div className="flex items-center gap-1.5">
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate text-[11px] font-bold sm:text-xs">{item.label}</span>
              </div>
              <div className="mt-2 text-2xl font-black leading-none text-slate-950">{item.value}</div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
