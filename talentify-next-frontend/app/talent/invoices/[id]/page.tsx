'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatJaDateTimeWithWeekday } from '@/utils/formatJaDateTimeWithWeekday'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { getInvoiceStatusLabel, getPaymentStatusLabel } from '@/lib/invoices/status'

const supabase = createClient()

function DetailRow({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 px-5 py-3.5 text-sm">
      <dt className="text-slate-500">{label}</dt>
      <dd className="max-w-[62vw] break-words text-right font-medium text-slate-900 sm:max-w-md">
        {children}
      </dd>
    </div>
  )
}

interface Invoice {
  id: string
  offer_id: string
  amount: number
  invoice_url: string | null
  transport_fee: number | null
  extra_fee: number | null
  notes: string | null
  invoice_number: string
  due_date: string | null
  status: string
  payment_status: string | null
  created_at: string | null
  offers: {
    status: string | null
    canceled_at: string | null
    canceled_by_role: string | null
    cancellation_reason: string | null
    cancellation_stage: string | null
    no_show_at: string | null
    no_show_reason: string | null
  } | null
}

interface RawInvoice extends Omit<Invoice, 'offers'> {
  offers:
    | Array<{
        status: string | null
        canceled_at: string | null
        canceled_by_role: string | null
        cancellation_reason: string | null
        cancellation_stage: string | null
        no_show_at: string | null
        no_show_reason: string | null
      }>
    | {
        status: string | null
        canceled_at: string | null
        canceled_by_role: string | null
        cancellation_reason: string | null
        cancellation_stage: string | null
        no_show_at: string | null
        no_show_reason: string | null
      }
    | null
}

export default function TalentInvoiceDetailPage() {
  const params = useParams()
  const id = params?.id as string
  const router = useRouter()
  const searchParams = useSearchParams()

  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)

  // 下書き中は支払期限とメモのみ編集可。請求書番号は自動採番・編集不可。
  const [dueDate, setDueDate] = useState('')
  const [notes, setNotes] = useState('')

  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select(
          'id,offer_id,amount,invoice_url,transport_fee,extra_fee,notes,invoice_number,due_date,status,payment_status,created_at,offers(status,canceled_at,canceled_by_role,cancellation_reason,cancellation_stage,no_show_at,no_show_reason)'
        )
        .eq('id', id)
        .single()

      if (error) {
        toast.error('読み込みに失敗しました')
        setLoading(false)
        return
      }

      const raw = data as unknown as RawInvoice | null
      const inv: Invoice | null = raw
        ? {
            ...raw,
            offers: Array.isArray(raw.offers) ? raw.offers[0] ?? null : raw.offers,
          }
        : null
      setInvoice(inv)
      setDueDate(inv?.due_date ?? '')
      setNotes(inv?.notes ?? '')
      setLoading(false)
    }
    if (id) load()
  }, [id])

  if (loading) return <div className="p-4">読み込み中...</div>
  if (!invoice) return <div className="p-4">データがありません</div>

  const baseFee =
    invoice.amount - (invoice.transport_fee ?? 0) - (invoice.extra_fee ?? 0)
  const isCanceled = invoice.offers?.status === 'canceled'
  const isNoShow = invoice.offers?.status === 'no_show'
  const isClosed = isCanceled || isNoShow
  const isRevisionRequest =
    searchParams.get('revision') === '1' &&
    invoice.status === 'draft' &&
    !isClosed

  const updatePayload = {
    due_date: dueDate || null,
    notes: notes || null,
  } as const

  const saveDraft = () =>
    fetch(`/api/invoices/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatePayload),
    })

  const handleSave = async () => {
    setSaving(true)
    const res = await saveDraft()
    setSaving(false)
    if (!res.ok) {
      toast.error('保存に失敗しました')
    } else {
      toast.success('保存しました')
      router.refresh()
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    const saveRes = await saveDraft()
    if (!saveRes.ok) {
      toast.error('見積書の提出に失敗しました')
      setSubmitting(false)
      return
    }
    const res = await fetch(`/api/invoices/${id}/submit`, { method: 'POST' })
    setSubmitting(false)
    if (res.ok) {
      toast.success('見積書を提出しました')
      router.replace('/talent/invoices')
    } else {
      toast.error('提出に失敗しました')
    }
  }

  const handleDownload = async () => {
    setDownloading(true)
    const res = await fetch(`/api/invoices/${id}/pdf`)
    setDownloading(false)
    if (res.ok) {
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${invoice.invoice_number}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } else {
      toast.error('PDFのダウンロードに失敗しました')
    }
  }

  const isEstimate =
    !isClosed &&
    (invoice.status === 'draft' || invoice.status === 'submitted' || invoice.status === 'rejected')

  return (
    <main className="mx-auto w-full max-w-3xl space-y-4 px-4 pb-28 pt-6 sm:px-6 sm:pb-8 lg:max-w-5xl lg:px-0 lg:pt-2">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,.05)]">
        <div className="p-5 sm:p-6">
          <Link href="/talent/invoices" className="text-sm font-bold text-slate-500 transition hover:text-[#C2410C]">
            ← 見積・請求一覧
          </Link>
          <p className="mt-4 text-[11px] font-black tracking-[0.16em] text-[#C2410C]">DOCUMENT DETAIL</p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
            {isEstimate ? '見積詳細' : '取引締結書兼請求書'}
          </h1>
        </div>
        <div className="h-1 bg-gradient-to-r from-[#FF3B2E] via-[#FF8A00] to-[#FFC400]" />
      </section>

      {isRevisionRequest && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <div className="font-bold">店舗から見積書の修正依頼が届いています</div>
          <p className="mt-1 leading-6 text-amber-800">
            内容を見直して保存し、「見積書を提出」で再提出してください。
          </p>
        </div>
      )}

      {invoice.offers?.status === 'canceled' && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <div className="font-bold">この取引はキャンセル済みです</div>
          <div className="mt-2 space-y-1 leading-6">
            <div>区分: {invoice.offers.cancellation_stage === 'post_contract' ? '契約成立後' : '契約成立前'}</div>
            <div>実行者: {invoice.offers.canceled_by_role === 'talent' ? '演者' : '店舗'}</div>
            {invoice.offers.canceled_at && (
              <div>キャンセル日時: {formatJaDateTimeWithWeekday(invoice.offers.canceled_at)}</div>
            )}
            <div className="whitespace-pre-wrap">理由: {invoice.offers.cancellation_reason || '-'}</div>
          </div>
        </div>
      )}

      {isNoShow && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
          <div className="font-bold">この取引は来店なしとして記録されています</div>
          <div className="mt-2 space-y-1 leading-6">
            {invoice.offers?.no_show_at && (
              <div>記録日時: {formatJaDateTimeWithWeekday(invoice.offers.no_show_at)}</div>
            )}
            <div className="whitespace-pre-wrap">理由: {invoice.offers?.no_show_reason || '-'}</div>
          </div>
        </div>
      )}

      <Card className="overflow-hidden rounded-2xl border-slate-200 shadow-[0_8px_24px_rgba(15,23,42,.05)]">
        <CardHeader className="space-y-4 border-b border-slate-100 bg-slate-50/80 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-lg">{isEstimate ? '見積情報' : '締結・請求情報'}</CardTitle>
            <Badge variant="outline" className="bg-white">
              {getInvoiceStatusLabel(invoice.status)}
            </Badge>
          </div>
          <div>
            <p className="text-xs font-semibold tracking-wide text-slate-500">合計金額</p>
            <p className="mt-1 text-3xl font-black tracking-tight text-slate-950">
              ¥{invoice.amount.toLocaleString('ja-JP')}
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <dl className="divide-y divide-slate-100">
            <DetailRow label="作成日">
              {formatJaDateTimeWithWeekday(invoice.created_at ?? '')}
            </DetailRow>
            <DetailRow label={isEstimate ? '管理番号' : '締結書兼請求書番号'}>
              {invoice.invoice_number}
            </DetailRow>
            <DetailRow label="支払期限">
              {invoice.status === 'draft' && !isClosed ? (
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="h-9 w-[10.5rem] text-right"
                />
              ) : invoice.due_date ? (
                formatJaDateTimeWithWeekday(invoice.due_date)
              ) : (
                '-'
              )}
            </DetailRow>
            <DetailRow label="支払い状態">
              <Badge variant={invoice.payment_status === 'paid' ? 'success' : 'secondary'}>
                {getPaymentStatusLabel(invoice.payment_status)}
              </Badge>
            </DetailRow>
          </dl>
        </CardContent>
      </Card>

      <Card className="overflow-hidden rounded-2xl border-slate-200 shadow-[0_8px_24px_rgba(15,23,42,.05)]">
        <CardHeader className="border-b border-slate-100 p-5">
          <CardTitle className="text-lg">金額内訳</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <dl className="divide-y divide-slate-100">
            <DetailRow label="基本報酬">¥{baseFee.toLocaleString('ja-JP')}</DetailRow>
            <DetailRow label="交通費">¥{(invoice.transport_fee ?? 0).toLocaleString('ja-JP')}</DetailRow>
            <DetailRow label="追加料金">¥{(invoice.extra_fee ?? 0).toLocaleString('ja-JP')}</DetailRow>
          </dl>
          <div className="border-t border-slate-100 px-5 py-4">
            <p className="mb-2 text-sm text-slate-500">メモ</p>
            {invoice.status === 'draft' && !isClosed ? (
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-28"
                placeholder="必要な補足があれば入力"
              />
            ) : (
              <p className="whitespace-pre-wrap text-sm font-medium text-slate-900">
                {invoice.notes || 'なし'}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-2 sm:grid-cols-2">
        {invoice.invoice_url && (
          <Button asChild variant="outline" className="min-h-11 w-full rounded-xl">
            <a href={`/api/invoices/${id}/attachment`} target="_blank" rel="noreferrer">
              アップロード済みPDFを開く
            </a>
          </Button>
        )}
        <Button onClick={handleDownload} disabled={downloading} variant="outline" className="min-h-11 w-full rounded-xl">
          {downloading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEstimate ? '見積書をダウンロード' : '締結書兼請求書をダウンロード'}
        </Button>
      </div>

      {invoice.status === 'draft' && !isClosed && (
        <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 gap-2 border-t border-slate-200 bg-white/95 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-10px_30px_rgba(15,23,42,0.08)] backdrop-blur sm:static sm:rounded-2xl sm:border sm:p-4 sm:shadow-sm">
          <Button onClick={handleSave} disabled={saving} variant="outline" className="min-h-12">
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            下書き保存
          </Button>
          <Button onClick={handleSubmit} disabled={submitting} className="min-h-12 rounded-xl bg-[#FF5A1F] font-bold text-white hover:bg-[#E94F18]">
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            見積書を提出
          </Button>
        </div>
      )}
    </main>
  )}
