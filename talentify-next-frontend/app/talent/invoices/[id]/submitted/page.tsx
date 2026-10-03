'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatJaDateTimeWithWeekday } from '@/utils/formatJaDateTimeWithWeekday'
import { getInvoiceStatusLabel, getPaymentStatusLabel } from '@/lib/invoices/status'

const supabase = createClient()

interface Invoice {
  id: string
  offer_id: string
  amount: number
  transport_fee: number | null
  extra_fee: number | null
  notes: string | null
  invoice_number: string
  due_date: string | null
  status: string
  payment_status: string | null
  created_at: string | null
}

export default function TalentInvoiceSubmittedPage() {
  const params = useParams()
  const id = params?.id as string

  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadInvoice = async () => {
      if (!id) {
        setLoading(false)
        return
      }
      const { data, error } = await supabase
        .from('invoices')
        .select(
          'id,offer_id,amount,transport_fee,extra_fee,notes,invoice_number,due_date,status,payment_status,created_at'
        )
        .eq('id', id)
        .maybeSingle()

      if (error) {
        console.error(error)
        setInvoice(null)
      } else {
        setInvoice((data as Invoice | null) ?? null)
      }
      setLoading(false)
    }

    loadInvoice()
  }, [id])

  const baseFee = useMemo(() => {
    if (!invoice) return 0
    const transport = invoice.transport_fee ?? 0
    const extra = invoice.extra_fee ?? 0
    return Math.max(0, invoice.amount - transport - extra)
  }, [invoice])

  if (loading) {
    return <div className='p-6'>読み込み中...</div>
  }

  if (!invoice) {
    return <div className='p-6'>見積書が見つかりませんでした。</div>
  }

  return (
    <main className='mx-auto w-full max-w-5xl space-y-5 p-4 sm:p-6 lg:p-0'>
      <section className='overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,.05)] sm:p-6'>
        <div>
          <p className='text-[11px] font-black tracking-[0.16em] text-[#C2410C]'>ESTIMATE SUBMITTED</p>
          <h1 className='mt-1 text-2xl font-black tracking-tight text-slate-950'>見積書の提出が完了しました</h1>
          <p className='text-sm text-muted-foreground'>見積内容をご確認ください。</p>
        </div>
        <div className='flex flex-wrap gap-2'>
          <Button asChild variant='default'>
            <Link href='/talent/invoices'>見積・請求一覧へ戻る</Link>
          </Button>
          <Button asChild variant='outline'>
            <Link href={`/talent/invoices/${invoice.id}`}>見積詳細を表示</Link>
          </Button>
        </div>
      </section>

      <div className='grid gap-4 lg:grid-cols-2'>
      <Card className='rounded-2xl border-slate-200 shadow-[0_8px_24px_rgba(15,23,42,.05)]'>
        <CardHeader>
          <CardTitle>見積情報</CardTitle>
        </CardHeader>
        <CardContent className='space-y-2 text-sm'>
          <div>作成日: {formatJaDateTimeWithWeekday(invoice.created_at ?? '')}</div>
          <div>管理番号: {invoice.invoice_number}</div>
          <div>
            支払期限:{' '}
            {invoice.due_date
              ? formatJaDateTimeWithWeekday(invoice.due_date)
              : '-'}
          </div>
          <div>
            見積ステータス: <Badge variant='outline'>{getInvoiceStatusLabel(invoice.status)}</Badge>
          </div>
          <div>
            支払い状態:{' '}
            <Badge variant={invoice.payment_status === 'paid' ? 'success' : 'secondary'}>
              {getPaymentStatusLabel(invoice.payment_status)}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card className='rounded-2xl border-slate-200 shadow-[0_8px_24px_rgba(15,23,42,.05)]'>
        <CardHeader>
          <CardTitle>金額内訳</CardTitle>
        </CardHeader>
        <CardContent className='space-y-2 text-sm'>
          <div>基本報酬: ¥{baseFee.toLocaleString('ja-JP')}</div>
          <div>交通費: ¥{(invoice.transport_fee ?? 0).toLocaleString('ja-JP')}</div>
          <div>追加料金: ¥{(invoice.extra_fee ?? 0).toLocaleString('ja-JP')}</div>
          <div>合計: ¥{invoice.amount.toLocaleString('ja-JP')}</div>
          <div>メモ: {invoice.notes ? invoice.notes : 'なし'}</div>
        </CardContent>
      </Card>
      </div>
    </main>
  )
}
