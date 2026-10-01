'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { formatJaDateTimeWithWeekday } from '@/utils/formatJaDateTimeWithWeekday'
import { Loader2 } from 'lucide-react'
import { getInvoiceStatusLabel, getPaymentStatusLabel } from '@/lib/invoices/status'

const supabase = createClient()

interface Invoice {
  id: string
  amount: number
  invoice_url: string | null
  status: string
  created_at: string | null
  offer_id: string
  transport_fee: number | null
  extra_fee: number | null
  notes: string | null
  invoice_number: string | null
  due_date: string | null
  payment_status: string | null
  offers: {
    paid: boolean | null
    status: string | null
    canceled_at: string | null
    canceled_by_role: string | null
    cancel_reason: string | null
    cancellation_phase: string | null
  } | null
  talent_id: string | null
  payout: {
    bank_name: string | null
    branch_name: string | null
    account_type: string | null
    account_number: string | null
    account_holder: string | null
  } | null
}

interface RawInvoice extends Omit<Invoice, 'offers' | 'payout'> {
  offers:
    | Array<{
        paid: boolean | null
        status: string | null
        canceled_at: string | null
        canceled_by_role: string | null
        cancel_reason: string | null
        cancellation_phase: string | null
      }>
    | null
}

function statusLabel(inv: Invoice): string {
  return getInvoiceStatusLabel(inv.status)
}

function paymentStatusLabel(inv: Invoice): string {
  return getPaymentStatusLabel(inv.payment_status, inv.offers?.paid)
}

export default function StoreInvoiceDetail() {
  const params = useParams()
  const id = params?.id as string
  const router = useRouter()

  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const load = async () => {
    const { data } = await supabase
      .from('invoices')
      .select(
        'id,amount,transport_fee,extra_fee,notes,invoice_number,due_date,invoice_url,status,payment_status,created_at,offer_id,talent_id,offers(paid,status,canceled_at,canceled_by_role,cancel_reason,cancellation_phase)'
      )
      .eq('id', id)
      .maybeSingle()
    const raw = data as unknown as RawInvoice | null
    if (!raw) {
      setInvoice(null)
      setLoading(false)
      return
    }

    let payout: Invoice['payout'] = null
    if (raw.talent_id) {
      const { data: payoutData } = await supabase
        .from('talent_payout_accounts')
        .select('bank_name,branch_name,account_type,account_number,account_holder')
        .eq('talent_id', raw.talent_id)
        .maybeSingle()
      payout = payoutData ?? null
    }

    setInvoice({
      ...raw,
      offers: Array.isArray(raw.offers) ? raw.offers[0] ?? null : raw.offers,
      payout,
    })
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const handlePay = async () => {
    setPaying(true)
    const res = await fetch(`/api/invoices/${id}/pay`, { method: 'POST' })
    setPaying(false)
    if (res.ok) {
      toast.success('支払いを記録しました')
      router.refresh()
      if (invoice?.offer_id) {
        router.push(`/store/offers/${invoice.offer_id}`)
      }
    } else {
      const result = await res.json().catch(() => null)
      toast.error(result?.message || '支払いの記録に失敗しました')
    }
  }

  const handleApprove = async () => {
    setUpdatingStatus(true)
    const res = await fetch(`/api/invoices/${id}/approve`, { method: 'POST' })
    setUpdatingStatus(false)
    if (res.ok) {
      toast.success('見積書を承認し、取引を締結しました')
      await load()
    } else {
      toast.error('見積承認に失敗しました')
    }
  }

  const handleReject = async () => {
    const ok = window.confirm('見積書の修正を依頼しますか？')
    if (!ok) return

    setUpdatingStatus(true)
    const res = await fetch(`/api/invoices/${id}/reject`, { method: 'POST' })
    setUpdatingStatus(false)
    if (res.ok) {
      toast.success('見積書の修正を依頼しました')
      await load()
    } else {
      toast.error('修正依頼に失敗しました')
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
      a.download = `invoice-${id}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } else {
      toast.error('PDFのダウンロードに失敗しました')
    }
  }

  if (loading) return <div className='p-4'>読み込み中...</div>
  if (!invoice) return <div className='p-4'>データがありません</div>

  const baseFee =
    invoice.amount - (invoice.transport_fee ?? 0) - (invoice.extra_fee ?? 0)
  const bank = invoice.payout
  const hasBankInfo = bank
    ? [
        bank.bank_name,
        bank.branch_name,
        bank.account_type,
        bank.account_number,
        bank.account_holder,
      ].some(Boolean)
    : false

  const isEstimate = invoice.status === 'draft' || invoice.status === 'submitted' || invoice.status === 'rejected'
  const isContracted = invoice.status === 'approved'

  return (
    <main className='space-y-4 p-3 sm:p-6'>
      <h1 className='text-xl font-bold'>{isEstimate ? '見積詳細' : '取引締結書兼請求書'}</h1>
      {invoice.offers?.status === 'canceled' && (
        <div className='rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900'>
          <div className='font-semibold'>この取引はキャンセル済みです</div>
          <div className='mt-2 space-y-1'>
            <div>区分: {invoice.offers.cancellation_phase === 'post_contract' ? '契約成立後' : '契約成立前'}</div>
            <div>実行者: {invoice.offers.canceled_by_role === 'talent' ? '演者' : '店舗'}</div>
            {invoice.offers.canceled_at && (
              <div>キャンセル日時: {formatJaDateTimeWithWeekday(invoice.offers.canceled_at)}</div>
            )}
            <div className='whitespace-pre-wrap'>理由: {invoice.offers.cancel_reason || '-'}</div>
          </div>
          {isContracted && (
            <p className='mt-2 text-xs text-amber-800'>
              締結書兼請求書は契約成立時点の履歴として保持されています。
            </p>
          )}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{isEstimate ? '見積情報' : '締結・請求情報'}</CardTitle>
        </CardHeader>
        <CardContent className='space-y-2 text-sm'>
          <div>作成日: {formatJaDateTimeWithWeekday(invoice.created_at ?? '')}</div>
          <div>金額: ¥{invoice.amount.toLocaleString('ja-JP')}</div>
          <div>{isEstimate ? '管理番号' : '締結書兼請求書番号'}: {invoice.invoice_number ?? '-'}</div>
          <div>
            支払期限:{' '}
            {invoice.due_date
              ? formatJaDateTimeWithWeekday(invoice.due_date)
              : '-'}
          </div>
          <div>
            {isEstimate ? '見積ステータス' : '取引ステータス'}:{' '}
            <Badge variant='outline'>{statusLabel(invoice)}</Badge>
          </div>
          <div>
            支払い状態:{' '}
            <Badge variant={invoice.offers?.paid ? 'success' : 'secondary'}>
              {paymentStatusLabel(invoice)}
            </Badge>
          </div>
          {invoice.invoice_url && (
            <div>
              <Link
                href={`/api/invoices/${invoice.id}/attachment`}
                className='text-blue-600 underline'
                target='_blank'
              >
                PDFを開く
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>金額内訳</CardTitle>
        </CardHeader>
        <CardContent className='space-y-2 text-sm'>
          <div>基本報酬: ¥{baseFee.toLocaleString('ja-JP')}</div>
          <div>
            交通費: ¥{(invoice.transport_fee ?? 0).toLocaleString('ja-JP')}
          </div>
          <div>
            追加料金: ¥{(invoice.extra_fee ?? 0).toLocaleString('ja-JP')}
          </div>
          <div>メモ: {invoice.notes || 'なし'}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>振込先情報</CardTitle>
        </CardHeader>
        <CardContent className='space-y-2 text-sm'>
          {hasBankInfo && bank ? (
            <>
              <div>銀行名: {bank.bank_name}</div>
              <div>支店名: {bank.branch_name}</div>
              <div>口座種別: {bank.account_type}</div>
              <div>口座番号: {bank.account_number}</div>
              <div>口座名義: {bank.account_holder}</div>
            </>
          ) : (
            <div>未登録</div>
          )}
        </CardContent>
      </Card>

      <Button onClick={handleDownload} disabled={downloading}>
        {downloading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
        {isEstimate ? '見積書をダウンロード' : '締結書兼請求書をダウンロード'}
      </Button>

      {invoice.status === 'submitted' && (
        <div className='flex gap-2'>
          <Button onClick={handleApprove} disabled={updatingStatus}>
            {updatingStatus && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            この見積内容で締結する
          </Button>
          <Button onClick={handleReject} disabled={updatingStatus} variant='outline'>
            {updatingStatus && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            修正を依頼する
          </Button>
        </div>
      )}

      {!invoice.offers?.paid && isContracted && invoice.offers?.status === 'completed' && (
        <Button onClick={handlePay} disabled={paying}>
          {paying && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
          支払い完了にする
        </Button>
      )}

      {!invoice.offers?.paid && isContracted && invoice.offers?.status !== 'completed' && (
        <div className='rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600'>
          来店完了を記録すると、支払い完了の操作ができるようになります。
        </div>
      )}
    </main>
  )
}
