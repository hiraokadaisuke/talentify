'use client'

import Link from 'next/link'

export type OfferSummaryInfo = {
  status?: string | null
  date?: string | null
  reward?: string | number | null
  location?: string | null
  time?: string | null
}

const STATUS_LABELS: Record<string, string> = {
  pending: '回答待ち',
  accepted: '承認済み',
  confirmed: '確定',
  completed: '完了',
  canceled: 'キャンセル',
  rejected: '辞退',
  no_show: '来店なし',
}

function formatOfferDate(value?: string | null) {
  if (!value) return '未設定'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('ja-JP', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    weekday: 'short',
  })
}

function formatReward(value?: string | number | null) {
  if (value === null || value === undefined || value === '') return '未設定'
  const parsed = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(parsed)) return String(value)
  return `${parsed.toLocaleString('ja-JP')}円`
}

function statusLabel(value?: string | null) {
  if (!value) return '確認中'
  return STATUS_LABELS[value] ?? value
}

function SummaryGrid({ offer }: { offer: OfferSummaryInfo }) {
  const rows = [
    ['来店日', formatOfferDate(offer.date)],
    ['希望時間', offer.time || '未設定'],
    ['報酬', formatReward(offer.reward)],
    ['ステータス', statusLabel(offer.status)],
  ] as const

  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
      {rows.map(([label, value]) => (
        <div key={label} className="min-w-0">
          <dt className="text-[11px] font-medium text-slate-500">{label}</dt>
          <dd className="mt-0.5 break-words text-sm font-semibold text-slate-900">{value}</dd>
        </div>
      ))}
    </dl>
  )
}

export default function OfferSummary({
  offer,
  role,
  offerId,
}: {
  offer: OfferSummaryInfo | null
  role: 'store' | 'talent'
  offerId?: string | null
}) {
  if (!offer) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3 text-xs text-slate-500">
        オファー情報を読み込めませんでした。詳細画面から内容をご確認ください。
      </div>
    )
  }

  return (
    <>
      <details className="rounded-xl border border-slate-200 bg-slate-50 sm:hidden">
        <summary className="cursor-pointer list-none px-3 py-2.5">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900">オファー情報</p>
              <p className="mt-0.5 truncate text-xs text-slate-500">
                {formatOfferDate(offer.date)} ・ {offer.time || '時間未設定'} ・ {statusLabel(offer.status)}
              </p>
            </div>
            <span className="shrink-0 text-xs font-semibold text-[#C2410C]">確認</span>
          </div>
        </summary>
        <div className="border-t border-slate-200 px-3 py-3">
          <SummaryGrid offer={offer} />
          {offerId && (
            <Link
              href={'/' + role + '/offers/' + offerId}
              className="mt-3 inline-flex text-xs font-semibold text-[#C2410C] hover:underline"
            >
              オファー詳細を開く →
            </Link>
          )}
        </div>
      </details>

      <div className="hidden rounded-xl border border-slate-200 bg-slate-50 p-3 sm:block">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h4 className="text-sm font-semibold text-slate-950">オファー概要</h4>
          {offerId && (
            <Link
              href={'/' + role + '/offers/' + offerId}
              className="text-xs font-semibold text-[#C2410C] hover:underline"
            >
              詳細を見る
            </Link>
          )}
        </div>
        <SummaryGrid offer={offer} />
      </div>
    </>
  )
}
