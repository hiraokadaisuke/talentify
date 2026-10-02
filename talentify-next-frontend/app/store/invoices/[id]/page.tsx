'use client'

import { useEffect, useState, type ReactNode } from 'react'
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
    cancellation_reason: string | null
    cancellation_stage: string | null
    no_show_at: string | null
    no_show_reason: string | null
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
        cancellation_reason: string | null
        cancellation_stage: string | null
        no_show_at: string | null
        no_show_reason: string | null
      }>
    | null
}

function statusLabel(inv: Invoice): string {
  return getInvoiceStatusLabel(inv.status)
}

function paymentStatusLabel(inv: Invoice): string {
  return getPaymentStatusLabel(inv.payment_status, inv.offers?.paid)
}

function DetailRow({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className='grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 px-5 py-3.5 text-sm'>
      <dt className='text-slate-500'>{label}</dt>
      <dd className='max-w-[62vw] break-words text-right font-medium text-slate-900 sm:max-w-md'>
        {children}
      </dd>
    </div>
  )
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
        'id,amount,transport_fee,extra_fee,notes,invoice_number,due_date,invoice_url,status,payment_status,created_at,offer_id,talent_id,offers(paid,status,canceled_at,canceled_by_role,cancellation_reason,cancellation_stage,no_show_at,no_show_reason)'
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
  const isCanceled = invoice.offers?.status === 'canceled'
  const isNoShow = invoice.offers?.status === 'no_show'
  const isClosed = isCanceled || isNoShow

  return (
    <main className='mx-auto w-full max-w-3xl space-y-4 px-4 pb-28 pt-6 sm:px-6 sm:pb-8'>
      <section className='overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,.05)]'>
        <div className='p-5 sm:p-6'>
          <Link href='/store/invoices' className='text-sm font-bold text-slate-500 transition hover:text-[#C2410C]'>
            ← 見積・請求一覧
          </Link>
          <p className='mt-4 text-[11px] font-black tracking-[0.16em] text-[#C2410C]'>DOCUMENT DETAIL</p>
          <h1 className='mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl'>
            {isEstimate ? '見積詳細' : '取引締結書兼請求書'}
          </h1>
        </div>
        <div className='h-1 bg-gradient-to-r from-[#FF3B2E] via-[#FF8A00] to-[#FFC400]' />
      </section>

      {invoice.offers?.status === 'canceled' && (
        <div className='rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900'>
          <div className='font-bold'>この取引はキャンセル済みです</div>
          <div className='mt-2 space-y-1 leading-6'>
            <div>区分: {invoice.offers.cancellation_stage === 'post_contract' ? '契約成立後' : '契約成立前'}</div>
            <div>実行者: {invoice.offers.canceled_by_role === 'talent' ? '演者' : '店舗'}</div>
            {invoice.offers.canceled_at && (
              <div>キャンセル日時: {formatJaDateTimeWithWeekday(invoice.offers.canceled_at)}</div>
            )}
            <div className='whitespace-pre-wrap'>理由: {invoice.offers.cancellation_reason || '-'}</div>
          </div>
          {isContracted && (
            <p className='mt-2 text-xs leading-5 text-amber-800'>
              締結書兼請求書は契約成立時点の履歴として保持されています。
            </p>
          )}
        </div>
      )}

      {isNoShow && (
        <div className='rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900'>
          <div className='font-bold'>この取引は来店なしとして記録されています</div>
          <div className='mt-2 space-y-1 leading-6'>
            <div>記録者: 店舗</div>
            {invoice.offers?.no_show_at && (
              <div>記録日時: {formatJaDateTimeWithWeekday(invoice.offers.no_show_at)}</div>
            )}
            <div className='whitespace-pre-wrap'>理由: {invoice.offers?.no_show_reason || '-'}</div>
          </div>
          <p className='mt-2 text-xs leading-5 text-red-800'>
            支払い・レビューには進みません。締結書兼請求書は契約成立時点の履歴として保持されています。
          </p>
        </div>
      )}

      <Card className='overflow-hidden rounded-2xl border-slate-200 shadow-[0_8px_24px_rgba(15,23,42,.05)]'>
        <CardHeader className='space-y-4 border-b border-slate-100 bg-slate-50/80 p-5'>
          <div className='flex flex-wrap items-center justify-between gap-2'>
            <CardTitle className='text-lg'>{isEstimate ? '見積情報' : '締結・請求情報'}</CardTitle>
            <Badge variant='outline' className='bg-white'>
              {statusLabel(invoice)}
            </Badge>
          </div>
          <div>
            <p className='text-xs font-semibold tracking-wide text-slate-500'>合計金額</p>
            <p className='mt-1 text-3xl font-black tracking-tight text-slate-950'>
              ¥{invoice.amount.toLocaleString('ja-JP')}
            </p>
          </div>
        </CardHeader>
        <CardContent className='p-0'>
          <dl className='divide-y divide-slate-100'>
            <DetailRow label='作成日'>{formatJaDateTimeWithWeekday(invoice.created_at ?? '')}</DetailRow>
            <DetailRow label={isEstimate ? '管理番号' : '締結書兼請求書番号'}>
              {invoice.invoice_number ?? '-'}
            </DetailRow>
            <DetailRow label='支払期限'>
              {invoice.due_date ? formatJaDateTimeWithWeekday(invoice.due_date) : '-'}
            </DetailRow>
            <DetailRow label='支払い状態'>
              <Badge variant={invoice.offers?.paid ? 'success' : 'secondary'}>
                {paymentStatusLabel(invoice)}
              </Badge>
            </DetailRow>
          </dl>
        </CardContent>
      </Card>

      <Card className='overflow-hidden rounded-2xl border-slate-200 shadow-[0_8px_24px_rgba(15,23,42,.05)]'>
        <CardHeader className='border-b border-slate-100 p-5'>
          <CardTitle className='text-lg'>金額内訳</CardTitle>
        </CardHeader>
        <CardContent className='p-0'>
          <dl className='divide-y divide-slate-100'>
            <DetailRow label='基本報酬'>¥{baseFee.toLocaleString('ja-JP')}</DetailRow>
            <DetailRow label='交通費'>¥{(invoice.transport_fee ?? 0).toLocaleString('ja-JP')}</DetailRow>
            <DetailRow label='追加料金'>¥{(invoice.extra_fee ?? 0).toLocaleString('ja-JP')}</DetailRow>
            <DetailRow label='メモ'>{invoice.notes || 'なし'}</DetailRow>
          </dl>
        </CardContent>
      </Card>

      <Card className='overflow-hidden rounded-2xl border-slate-200 shadow-[0_8px_24px_rgba(15,23,42,.05)]'>
        <CardHeader className='border-b border-slate-100 p-5'>
          <CardTitle className='text-lg'>振込先情報</CardTitle>
        </CardHeader>
        <CardContent className='p-0'>
          {hasBankInfo && bank ? (
            <dl className='divide-y divide-slate-100'>
              <DetailRow label='銀行名'>{bank.bank_name || '-'}</DetailRow>
              <DetailRow label='支店名'>{bank.branch_name || '-'}</DetailRow>
              <DetailRow label='口座種別'>{bank.account_type || '-'}</DetailRow>
              <DetailRow label='口座番号'>{bank.account_number || '-'}</DetailRow>
              <DetailRow label='口座名義'>{bank.account_holder || '-'}</DetailRow>
            </dl>
          ) : (
            <div className='px-5 py-5 text-sm text-slate-500'>未登録</div>
          )}
        </CardContent>
      </Card>

      <div className='grid gap-2 sm:grid-cols-2'>
        {invoice.invoice_url && (
          <Button asChild variant='outline' className='min-h-11 w-full rounded-xl'>
            <Link href={`/api/invoices/${invoice.id}/attachment`} target='_blank'>
              アップロード済みPDFを開く
            </Link>
          </Button>
        )}
        <Button
          onClick={handleDownload}
          disabled={downloading}
          variant='outline'
          className='min-h-11 w-full rounded-xl'
        >
          {downloading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
          {isEstimate ? '見積書をダウンロード' : '締結書兼請求書をダウンロード'}
        </Button>
      </div>

      {invoice.status === 'submitted' && !isClosed && (
        <div className='fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 gap-2 border-t border-slate-200 bg-white/95 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-10px_30px_rgba(15,23,42,0.08)] backdrop-blur sm:static sm:rounded-2xl sm:border sm:p-4 sm:shadow-sm'>
          <Button
            onClick={handleReject}
            disabled={updatingStatus}
            variant='outline'
            className='min-h-12'
          >
            {updatingStatus && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            修正を依頼
          </Button>
          <Button onClick={handleApprove} disabled={updatingStatus} className='min-h-12 rounded-xl bg-[#FF5A1F] font-bold text-white hover:bg-[#E94F18]'>
            {updatingStatus && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            この内容で締結
          </Button>
        </div>
      )}

      {!isClosed && !invoice.offers?.paid && isContracted && invoice.offers?.status === 'completed' && (
        <Button onClick={handlePay} disabled={paying} className='min-h-12 w-full rounded-xl bg-[#FF5A1F] font-bold text-white hover:bg-[#E94F18]'>
          {paying && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
          支払い完了にする
        </Button>
      )}

      {!isClosed && !invoice.offers?.paid && isContracted && invoice.offers?.status !== 'completed' && (
        <div className='rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600'>
          来店完了を記録すると、支払い完了の操作ができるようになります。
        </div>
      )}
    </main>
  )}
