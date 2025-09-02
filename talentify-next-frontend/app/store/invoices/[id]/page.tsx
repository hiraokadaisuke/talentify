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

const supabase = createClient()

interface Invoice {
  id: string
  amount: number
  invoice_url: string | null
  status: string
  created_at: string | null
  offers: { paid: boolean | null } | null
}

interface RawInvoice extends Omit<Invoice, 'offers'> {
  offers: { paid: boolean | null }[] | null
}

function statusLabel(inv: Invoice): string {
  if (inv.offers?.paid) return '支払い完了'
  switch (inv.status) {
    case 'submitted':
      return '承認待ち'
    case 'approved':
      return '承認済み'
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

  const load = async () => {
    const { data } = await supabase
      .from('invoices')
      .select('id,amount,invoice_url,status,created_at,offers(paid)')
      .eq('id', id)
      .maybeSingle()
    const raw = data as unknown as RawInvoice | null
    const normalized = raw
      ? {
          ...raw,
          offers: Array.isArray(raw.offers) ? raw.offers[0] ?? null : raw.offers,
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
    const res = await fetch(`/api/invoices/${id}/pay`, { method: 'POST' })
    if (res.ok) {
      toast.success('支払いを記録しました')
      router.refresh()
      await load()
    } else {
      toast.error('支払いの記録に失敗しました')
    }
  }

  if (loading) return <div className='p-4'>読み込み中...</div>
  if (!invoice) return <div className='p-4'>データがありません</div>

  return (
    <main className='p-6 space-y-4'>
      <h1 className='text-xl font-bold'>請求詳細</h1>
      <Card>
        <CardHeader>
          <CardTitle>請求情報</CardTitle>
        </CardHeader>
        <CardContent className='space-y-2 text-sm'>
          <div>作成日: {formatJaDateTimeWithWeekday(invoice.created_at ?? '')}</div>
          <div>金額: ¥{invoice.amount.toLocaleString()}</div>
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

      {!invoice.offers?.paid && (
        <Button onClick={handlePay}>支払い完了にする</Button>
      )}
    </main>
  )
}
