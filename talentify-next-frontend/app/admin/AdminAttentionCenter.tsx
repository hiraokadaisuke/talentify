'use client'

import { useEffect, useState } from 'react'
import {
  AlertTriangle,
  CircleDollarSign,
  Clock3,
  Eye,
  Loader2,
  MessageSquareWarning,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

type AttentionOffer = {
  id: string
  store_id: string | null
  talent_id: string | null
  store_name: string | null
  talent_name: string | null
  date: string | null
  status: string | null
  event_name: string | null
  reward: number | string | null
  updated_at: string | null
  created_at: string | null
  visit_completed_at: string | null
  paid: boolean | null
  paid_at: string | null
  invoice_amount: number | string | null
  canceled_at: string | null
  cancellation_reason: string | null
  no_show_at: string | null
  no_show_reason: string | null
}

type AttentionInquiry = {
  id: string
  created_at: string
  category: string
  name: string
  email: string
  subject: string
  status: string
}

type AttentionData = {
  thresholds: {
    staleDays: number
    exceptionDays: number
  }
  counts: {
    inquiries: number
    staleOffers: number
    unpaidOffers: number
    exceptions: number
  }
  inquiries: AttentionInquiry[]
  staleOffers: AttentionOffer[]
  unpaidOffers: AttentionOffer[]
  exceptions: AttentionOffer[]
}

type Props = {
  refreshKey: number
  onOpenOffer: (id: string) => void
  onShowInquiries: () => void
}

function formatDate(value: string | null | undefined) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function formatMoney(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === '') return '-'
  const amount = Number(value)
  if (!Number.isFinite(amount)) return String(value)
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    maximumFractionDigits: 0,
  }).format(amount)
}

function statusLabel(status: string | null | undefined) {
  const labels: Record<string, string> = {
    draft: '下書き',
    pending: '対応待ち',
    approved: '承認済み',
    offer_created: 'オファー作成',
    submitted: '提出済み',
    confirmed: '契約済み',
    completed: '完了',
    rejected: '辞退',
    canceled: 'キャンセル',
    no_show: '来店なし',
    new: '未対応',
    in_progress: '対応中',
  }
  return status ? labels[status] ?? status : '-'
}

function OfferRow({
  offer,
  kind,
  onOpen,
}: {
  offer: AttentionOffer
  kind: 'stale' | 'unpaid' | 'exception'
  onOpen: () => void
}) {
  const exceptionText = offer.no_show_at
    ? `来店なし: ${offer.no_show_reason || '理由未記録'}`
    : offer.canceled_at
      ? `キャンセル: ${offer.cancellation_reason || '理由未記録'}`
      : null

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-slate-900">{offer.event_name || '案件'}</p>
            <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600">
              {statusLabel(offer.status)}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {offer.store_name || '-'} → {offer.talent_name || '-'}
          </p>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
            <span>来店: {formatDate(offer.date)}</span>
            {kind === 'stale' && <span>最終更新: {formatDate(offer.updated_at)}</span>}
            {kind === 'unpaid' && (
              <>
                <span>来店完了: {formatDate(offer.visit_completed_at)}</span>
                <span>請求額: {formatMoney(offer.invoice_amount)}</span>
              </>
            )}
            {kind === 'exception' && (
              <span>{offer.no_show_at ? formatDate(offer.no_show_at) : formatDate(offer.canceled_at)}</span>
            )}
          </div>
          {exceptionText && (
            <p className="mt-2 text-xs leading-5 text-slate-600">{exceptionText}</p>
          )}
        </div>
        <Button type="button" size="sm" variant="outline" onClick={onOpen}>
          <Eye className="mr-1 h-4 w-4" />
          詳細
        </Button>
      </div>
    </div>
  )
}

export default function AdminAttentionCenter({
  refreshKey,
  onOpenOffer,
  onShowInquiries,
}: Props) {
  const [data, setData] = useState<AttentionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)
      setLoadError(false)

      try {
        const response = await fetch('/api/admin/attention', { cache: 'no-store' })
        if (!response.ok) throw new Error('admin_attention_failed')
        const payload = (await response.json()) as { data?: AttentionData }
        if (!payload.data) throw new Error('admin_attention_missing')
        if (!cancelled) setData(payload.data)
      } catch (error) {
        console.error('failed to load admin attention center', error)
        if (!cancelled) setLoadError(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [refreshKey])

  if (loading) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          要対応情報を確認中...
        </div>
      </section>
    )
  }

  if (loadError || !data) {
    return (
      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
        <div className="flex items-center gap-2 font-semibold text-amber-900">
          <AlertTriangle className="h-5 w-5" />
          要対応情報を読み込めませんでした
        </div>
        <p className="mt-1 text-sm text-amber-800">上部の「再読み込み」から再試行できます。</p>
      </section>
    )
  }

  const total =
    data.counts.inquiries +
    data.counts.staleOffers +
    data.counts.unpaidOffers +
    data.counts.exceptions

  const cards = [
    {
      key: 'inquiries',
      label: '未完了問い合わせ',
      value: data.counts.inquiries,
      note: '未対応・対応中',
      icon: MessageSquareWarning,
    },
    {
      key: 'stale',
      label: '更新が止まった案件',
      value: data.counts.staleOffers,
      note: `契約前・${data.thresholds.staleDays}日以上`,
      icon: Clock3,
    },
    {
      key: 'unpaid',
      label: '支払い未完了',
      value: data.counts.unpaidOffers,
      note: '来店完了後・未払い',
      icon: CircleDollarSign,
    },
    {
      key: 'exceptions',
      label: '例外案件',
      value: data.counts.exceptions,
      note: `直近${data.thresholds.exceptionDays}日のキャンセル/no-show`,
      icon: AlertTriangle,
    },
  ] as const

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold tracking-[0.14em] text-[#FF5A1F]">ATTENTION</p>
          <h2 className="mt-1 text-xl font-bold text-slate-950">要対応・要確認</h2>
          <p className="mt-1 text-sm text-slate-500">
            運営が先に確認したい項目を自動でまとめています。表示のみで、ここからデータは変更しません。
          </p>
        </div>
        <div className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700">
          合計 {total}件
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(card => {
          const Icon = card.icon
          return (
            <div key={card.key} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-slate-500">{card.label}</p>
                  <p className="mt-1 text-2xl font-bold text-slate-950">{card.value}</p>
                  <p className="mt-1 text-[11px] text-slate-400">{card.note}</p>
                </div>
                <Icon className="h-5 w-5 text-slate-500" />
              </div>
            </div>
          )
        })}
      </div>

      {total === 0 ? (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="font-semibold text-emerald-900">現在、要対応として検出された項目はありません。</p>
          <p className="mt-1 text-sm text-emerald-800">
            問い合わせや案件状況に変化があれば、この欄へ自動で表示されます。
          </p>
        </div>
      ) : (
        <div className="mt-5 space-y-5">
          {data.inquiries.length > 0 && (
            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <h3 className="text-sm font-bold text-slate-900">未完了問い合わせ</h3>
                <Button type="button" size="sm" variant="outline" onClick={onShowInquiries}>
                  問い合わせ一覧へ
                </Button>
              </div>
              <div className="space-y-2">
                {data.inquiries.map(inquiry => (
                  <div key={inquiry.id} className="rounded-xl border border-slate-200 bg-white p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold text-slate-900">{inquiry.subject}</p>
                      <span className="text-xs text-slate-500">{statusLabel(inquiry.status)}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {inquiry.name} / {inquiry.email}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-400">{formatDate(inquiry.created_at)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.staleOffers.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-bold text-slate-900">
                契約前で{data.thresholds.staleDays}日以上更新がない案件
              </h3>
              <div className="space-y-2">
                {data.staleOffers.map(offer => (
                  <OfferRow
                    key={offer.id}
                    offer={offer}
                    kind="stale"
                    onOpen={() => onOpenOffer(offer.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {data.unpaidOffers.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-bold text-slate-900">来店完了後の支払い未完了</h3>
              <div className="space-y-2">
                {data.unpaidOffers.map(offer => (
                  <OfferRow
                    key={offer.id}
                    offer={offer}
                    kind="unpaid"
                    onOpen={() => onOpenOffer(offer.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {data.exceptions.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-bold text-slate-900">
                直近{data.thresholds.exceptionDays}日のキャンセル・no-show
              </h3>
              <div className="space-y-2">
                {data.exceptions.map(offer => (
                  <OfferRow
                    key={offer.id}
                    offer={offer}
                    kind="exception"
                    onOpen={() => onOpenOffer(offer.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {(data.counts.inquiries > data.inquiries.length ||
        data.counts.staleOffers > data.staleOffers.length ||
        data.counts.unpaidOffers > data.unpaidOffers.length ||
        data.counts.exceptions > data.exceptions.length) && (
        <p className="mt-4 text-[11px] text-slate-400">
          各項目は最大20件まで表示しています。件数は全件数です。
        </p>
      )}
    </section>
  )
}
