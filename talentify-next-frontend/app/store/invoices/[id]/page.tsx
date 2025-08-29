'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatJaDateTimeWithWeekday } from '@/utils/formatJaDateTimeWithWeekday'

const supabase = createClient()

interface Invoice {
  id: string
  amount: number
  due_date: string | null
  invoice_number: string | null
  invoice_url: string | null
  status: string
  created_at: string | null
  updated_at: string | null
  offers: {
    date: string | null
    reward: number | null
    paid: boolean | null
    paid_at: string | null
    talents: { stage_name: string | null } | null
    stores: { store_name: string | null } | null
  } | null
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

function statusBadge(inv: Invoice) {
  if (inv.offers?.paid) return <Badge variant='success'>支払い完了</Badge>
  switch (inv.status) {
    case 'submitted':
      return <Badge variant='secondary'>承認待ち</Badge>
    case 'approved':
      return <Badge>承認済み</Badge>
    case 'rejected':
      return <Badge variant='destructive'>差し戻し済み</Badge>
    default:
      return <Badge variant='outline'>下書き</Badge>
  }
}

export default function StoreInvoiceDetail() {
  const params = useParams()
  const id = params?.id as string

  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [paidAt, setPaidAt] = useState('')
  const [memo, setMemo] = useState('')

  const load = async () => {
    const { data } = await supabase
      .from('invoices')
      .select(
        '*, offers(date,reward,paid,paid_at, talents(stage_name), stores(store_name))'
      )
      .eq('id', id)
      .maybeSingle()
    if (data) {
      const inv = data as unknown as Invoice
      setInvoice(inv)
      setPaidAt(inv.offers?.paid_at ?? '')
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const handleApprove = async () => {
    await fetch(`/api/invoices/${id}/approve`, { method: 'POST' })
    await load()
  }

  const handleReject = async () => {
    await fetch(`/api/invoices/${id}/reject`, { method: 'POST' })
    await load()
  }

  const handlePay = async () => {
    await fetch(`/api/invoices/${id}/pay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paid_at: paidAt, memo }),
    })
    await load()
  }

  if (loading) return <div className='p-4'>読み込み中...</div>
  if (!invoice) return <div className='p-4'>データがありません</div>

  return (
    <main className='p-6 space-y-4'>
      <h1 className='text-xl font-bold'>請求詳細</h1>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            請求情報 {statusBadge(invoice)}
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-1 text-sm'>
          <div>請求額: ¥{invoice.amount.toLocaleString()}</div>
          <div>期日: {formatJaDateTimeWithWeekday(invoice.due_date ?? '')}</div>
          <div>請求番号: {invoice.invoice_number}</div>
          {invoice.invoice_url && (
            <div>
              <Link
                href={invoice.invoice_url}
                className='text-blue-600 underline'
                target='_blank'
              >
                請求書を表示
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {invoice.offers && (
        <Card>
          <CardHeader>
            <CardTitle>オファー情報</CardTitle>
          </CardHeader>
          <CardContent className='space-y-1 text-sm'>
            <div>店舗: {invoice.offers.stores?.store_name}</div>
            <div>
              出演日: {formatJaDateTimeWithWeekday(invoice.offers.date ?? '')}
            </div>
            <div>演者: {invoice.offers.talents?.stage_name}</div>
            <div>
              目安報酬: ¥{invoice.offers.reward?.toLocaleString?.() ?? 0}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>ステータス履歴</CardTitle>
        </CardHeader>
        <CardContent className='text-sm'>
          <ul className='space-y-1'>
            <li>作成: {formatJaDateTimeWithWeekday(invoice.created_at ?? '')}</li>
            <li>
              更新: {formatJaDateTimeWithWeekday(invoice.updated_at ?? '')} (
              {statusLabel(invoice)})
            </li>
          </ul>
        </CardContent>
      </Card>

      {invoice.status === 'submitted' && (
        <div className='flex gap-2'>
          <Button onClick={handleApprove}>承認</Button>
          <Button variant='secondary' onClick={handleReject}>
            差し戻し
          </Button>
        </div>
      )}

      {invoice.status === 'approved' && !invoice.offers?.paid && (
        <Card>
          <CardHeader>
            <CardTitle>支払記録</CardTitle>
          </CardHeader>
          <CardContent className='space-y-2'>
            <div className='space-y-1'>
              <Label htmlFor='paidAt'>支払日</Label>
              <Input
                id='paidAt'
                type='date'
                value={paidAt}
                onChange={(e) => setPaidAt(e.target.value)}
              />
            </div>
            <div className='space-y-1'>
              <Label htmlFor='memo'>メモ</Label>
              <Input
                id='memo'
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
              />
            </div>
            <Button onClick={handlePay}>支払い済みにする</Button>
          </CardContent>
        </Card>
      )}
    </main>
  )
}

