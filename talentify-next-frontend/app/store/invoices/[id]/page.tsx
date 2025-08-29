'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'
import { formatJaDateTimeWithWeekday } from '@/utils/formatJaDateTimeWithWeekday'

const supabase = createClient()

const statusLabels: Record<string, string> = {
  draft: '下書き',
  submitted: '請求済み',
  approved: '承認済み',
  paid: '支払完了',
  rejected: '差し戻し',
}

export default function StoreInvoiceDetail() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string

  const [invoice, setInvoice] = useState<any | null>(null)
  const [paidAt, setPaidAt] = useState('')
  const [paymentStatus, setPaymentStatus] = useState('paid')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', id)
        .maybeSingle()
      if (!error && data) {
        setInvoice(data)
        setPaidAt(data.paid_at ?? '')
        setPaymentStatus(data.payment_status ?? 'paid')
      }
      setLoading(false)
    }
    load()
  }, [id])

  const handleApprove = async () => {
    await fetch(`/api/invoices/${id}/approve`, { method: 'POST' })
    router.push('/store/invoices')
  }

  const handleReject = async () => {
    await fetch(`/api/invoices/${id}/reject`, { method: 'POST' })
    router.push('/store/invoices')
  }

  const handleMarkPaid = async () => {
    await fetch(`/api/invoices/${id}/mark-paid`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paid_at: paidAt, payment_status: paymentStatus })
    })
    router.push('/store/invoices')
  }

  if (loading) return <div className='p-4'>読み込み中...</div>
  if (!invoice) return <div className='p-4'>データがありません</div>

  const total = Number(invoice.amount)

  return (
    <main className='p-6 space-y-4'>
      <h1 className='text-xl font-bold'>請求詳細</h1>
      <Table>
        <TableBody>
          <TableRow>
            <TableCell className='font-medium'>報酬</TableCell>
            <TableCell>¥{invoice.amount.toLocaleString()}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className='font-medium'>請求書番号</TableCell>
            <TableCell>{invoice.invoice_number}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className='font-medium'>支払期限</TableCell>
            <TableCell>{formatJaDateTimeWithWeekday(invoice.due_date)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className='font-medium'>合計金額</TableCell>
            <TableCell>¥{total.toLocaleString()}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className='font-medium'>ステータス</TableCell>
            <TableCell>{statusLabels[invoice.status]}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
      {invoice.status === 'submitted' && (
        <div className='flex gap-2'>
          <Button onClick={handleApprove}>承認して支払う</Button>
          <Button variant='secondary' onClick={handleReject}>差し戻す</Button>
        </div>
      )}
      {invoice.status === 'approved' && (
        <div className='space-y-2'>
          <div>
            <label className='block mb-2'>支払日</label>
            <Input type='date' value={paidAt} onChange={e => setPaidAt(e.target.value)} />
          </div>
          <div>
            <label className='block mb-2'>支払状況</label>
            <select
              className='border rounded p-2'
              value={paymentStatus}
              onChange={e => setPaymentStatus(e.target.value)}
            >
              <option value='paid'>支払済み</option>
              <option value='pending'>未払い</option>
              <option value='cancelled'>キャンセル</option>
            </select>
          </div>
          <Button onClick={handleMarkPaid}>支払いを記録</Button>
        </div>
      )}
    </main>
  )
}
