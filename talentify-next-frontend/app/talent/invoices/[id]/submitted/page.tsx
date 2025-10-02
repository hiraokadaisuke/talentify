'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatJaDateTimeWithWeekday } from '@/utils/formatJaDateTimeWithWeekday'

const supabase = createClient()

interface Invoice {
  id: string
  offer_id: string
  amount: number
  transport_fee: number | null
  extra_fee: number | null
  notes: string | null
  invoice_number: string | null
  due_date: string | null
  status: string
  payment_status: string | null
  created_at: string | null
}

const statusLabels: Record<string, string> = {
  draft: '下書き',
  approved: '提出済み',
  submitted: '提出済み',
  paid: '支払い済み',
  rejected: '差し戻し',
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
    return <div className='p-6'>請求書が見つかりませんでした。</div>
  }

  return (
    <main className='p-6 space-y-6'>
      <section className='space-y-4'>
        <div>
          <h1 className='text-xl font-bold'>請求書の提出が完了しました</h1>
          <p className='text-sm text-muted-foreground'>請求内容をご確認ください。</p>
        </div>
        <div className='flex flex-wrap gap-2'>
          <Button asChild variant='default'>
            <Link href='/talent/invoices'>請求履歴へ戻る</Link>
          </Button>
          <Button asChild variant='outline'>
            <Link href={`/talent/invoices/${invoice.id}`}>請求詳細を表示</Link>
          </Button>
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>請求情報</CardTitle>
        </CardHeader>
        <CardContent className='space-y-2 text-sm'>
          <div>作成日: {formatJaDateTimeWithWeekday(invoice.created_at ?? '')}</div>
          <div>請求書番号: {invoice.invoice_number ?? '-'}</div>
          <div>
            支払期限:{' '}
            {invoice.due_date
              ? formatJaDateTimeWithWeekday(invoice.due_date)
              : '-'}
          </div>
          <div>
            ステータス:{' '}
            <Badge variant='outline'>
              {invoice.payment_status === 'paid'
                ? '支払い済み'
                : statusLabels[invoice.status] ?? invoice.status}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
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
    </main>
  )
}
