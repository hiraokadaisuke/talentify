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
  offers: { paid: boolean | null } | null
  talents: {
    bank_name: string | null
    branch_name: string | null
    account_type: string | null
    account_number: string | null
    account_holder: string | null
  } | null
}

interface RawInvoice extends Omit<Invoice, 'offers' | 'talents'> {
  offers: { paid: boolean | null }[] | null
  talents: {
    bank_name: string | null
    branch_name: string | null
    account_type: string | null
    account_number: string | null
    account_holder: string | null
  }[] | null
}

function statusLabel(inv: Invoice): string {
  if (inv.offers?.paid) return '支払い完了'
  switch (inv.status) {
    case 'approved':
    case 'submitted':
      return '提出済み'
    case 'rejected':
      return '差し戻し済み'
    default:
      return '下書き'
  }
}

export default function StoreInvoiceDetail() {
  const params = useParams()
  const id = params?.id as string
  const router = useRouter()

  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const load = async () => {
    const { data } = await supabase
      .from('invoices')
      .select(
        'id,amount,transport_fee,extra_fee,notes,invoice_number,due_date,invoice_url,status,created_at,offer_id,offers(paid),talents:talent_id(bank_name,branch_name,account_type,account_number,account_holder)'
      )
      .eq('id', id)
      .maybeSingle()
    const raw = data as unknown as RawInvoice | null
    const normalized = raw
      ? {
          ...raw,
          offers: Array.isArray(raw.offers) ? raw.offers[0] ?? null : raw.offers,
          talents: Array.isArray(raw.talents) ? raw.talents[0] ?? null : raw.talents,
        }
      : null
    setInvoice(normalized)
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
        router.push(`/store/reviews/new?offerId=${invoice.offer_id}`)
      }
    } else {
      toast.error('支払いの記録に失敗しました')
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
  const bank = invoice.talents
  const hasBankInfo = bank
    ? [
        bank.bank_name,
        bank.branch_name,
        bank.account_type,
        bank.account_number,
        bank.account_holder,
      ].some(Boolean)
    : false

  return (
    <main className='p-6 space-y-4'>
      <h1 className='text-xl font-bold'>請求詳細</h1>
      <Card>
        <CardHeader>
          <CardTitle>請求情報</CardTitle>
        </CardHeader>
        <CardContent className='space-y-2 text-sm'>
          <div>作成日: {formatJaDateTimeWithWeekday(invoice.created_at ?? '')}</div>
          <div>金額: ¥{invoice.amount.toLocaleString('ja-JP')}</div>
          <div>請求書番号: {invoice.invoice_number ?? '-'}</div>
          <div>
            支払期限:{' '}
            {invoice.due_date
              ? formatJaDateTimeWithWeekday(invoice.due_date)
              : '-'}
          </div>
          <div>
            ステータス:{' '}
            <Badge variant='outline'>{statusLabel(invoice)}</Badge>
          </div>
          {invoice.invoice_url && (
            <div>
              <Link
                href={invoice.invoice_url}
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
        請求書をダウンロード
      </Button>

      {!invoice.offers?.paid && invoice.status !== 'draft' && (
        <Button onClick={handlePay} disabled={paying}>
          {paying && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
          支払い完了にする
        </Button>
      )}
    </main>
  )
}
