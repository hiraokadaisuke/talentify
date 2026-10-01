'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
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
    cancel_reason: string | null
    cancellation_phase: string | null
  } | null
}

export default function TalentInvoiceDetailPage() {
  const params = useParams()
  const id = params?.id as string
  const router = useRouter()

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
          'id,offer_id,amount,invoice_url,transport_fee,extra_fee,notes,invoice_number,due_date,status,payment_status,created_at,offers(status,canceled_at,canceled_by_role,cancel_reason,cancellation_phase)'
        )
        .eq('id', id)
        .single()

      if (error) {
        toast.error('読み込みに失敗しました')
        setLoading(false)
        return
      }

      const inv = data as Invoice | null
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

  const isEstimate = invoice.status === 'draft' || invoice.status === 'submitted' || invoice.status === 'rejected'

  return (
    <main className="space-y-4 p-3 sm:p-6">
      <h1 className="text-xl font-bold">{isEstimate ? '見積詳細' : '取引締結書兼請求書'}</h1>

      {invoice.offers?.status === 'canceled' && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <div className="font-semibold">この取引はキャンセル済みです</div>
          <div className="mt-2 space-y-1">
            <div>区分: {invoice.offers.cancellation_phase === 'post_contract' ? '契約成立後' : '契約成立前'}</div>
            <div>実行者: {invoice.offers.canceled_by_role === 'talent' ? '演者' : '店舗'}</div>
            {invoice.offers.canceled_at && (
              <div>キャンセル日時: {formatJaDateTimeWithWeekday(invoice.offers.canceled_at)}</div>
            )}
            <div className="whitespace-pre-wrap">理由: {invoice.offers.cancel_reason || '-'}</div>
          </div>
          {!isEstimate && (
            <p className="mt-2 text-xs text-amber-800">
              締結書兼請求書は契約成立時点の履歴として保持されています。
            </p>
          )}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{isEstimate ? '見積情報' : '締結・請求情報'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>作成日: {formatJaDateTimeWithWeekday(invoice.created_at ?? '')}</div>

          {/* 請求書番号は編集不可（自動採番・表示のみ） */}
          <div>{isEstimate ? '管理番号' : '締結書兼請求書番号'}: {invoice.invoice_number}</div>

          <div className="flex items-center gap-2">
            <span className="shrink-0">支払期限:</span>
            {invoice.status === 'draft' ? (
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-48"
              />
            ) : invoice.due_date ? (
              <span>{formatJaDateTimeWithWeekday(invoice.due_date)}</span>
            ) : (
              <span>-</span>
            )}
          </div>

          <div>
            {isEstimate ? '見積ステータス' : '取引ステータス'}:{' '}
            <Badge variant="outline">{getInvoiceStatusLabel(invoice.status)}</Badge>
          </div>
          <div>
            支払い状態:{' '}
            <Badge variant={invoice.payment_status === 'paid' ? 'success' : 'secondary'}>
              {getPaymentStatusLabel(invoice.payment_status)}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>金額内訳</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>基本報酬: ¥{baseFee.toLocaleString('ja-JP')}</div>
          <div>交通費: ¥{(invoice.transport_fee ?? 0).toLocaleString('ja-JP')}</div>
          <div>追加料金: ¥{(invoice.extra_fee ?? 0).toLocaleString('ja-JP')}</div>

          <div className="space-y-1">
            <div>メモ:</div>
            {invoice.status === 'draft' ? (
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
            ) : (
              <div>{invoice.notes || 'なし'}</div>
            )}
          </div>
        </CardContent>
      </Card>

      {invoice.status === 'draft' && (
        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            保存
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            見積書を提出
          </Button>
        </div>
      )}

      {invoice.invoice_url && (
        <Button asChild variant='outline'>
          <a
            href={`/api/invoices/${id}/attachment`}
            target='_blank'
            rel='noreferrer'
          >
            アップロード済みPDFを開く
          </a>
        </Button>
      )}

      <Button onClick={handleDownload} disabled={downloading} variant='outline'>
        {downloading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
        {isEstimate ? '見積書をダウンロード' : '締結書兼請求書をダウンロード'}
      </Button>
    </main>
  )
}
