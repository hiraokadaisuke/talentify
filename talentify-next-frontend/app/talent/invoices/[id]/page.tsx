'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
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

export default function TalentInvoiceDetail() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string

  const [invoice, setInvoice] = useState<any | null>(null)
  const [amount, setAmount] = useState('')
  const [memo, setMemo] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('*, offers(reward)')
        .eq('id', id)
        .maybeSingle()
      if (!error && data) {
        setInvoice(data)
        setAmount(String(data.amount ?? ''))
      }
      setLoading(false)
    }
    load()
  }, [id])

  const handleSubmit = async () => {
    if (!invoice) return
    await fetch(`/api/invoices/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: Number(amount) })
    })
    await fetch(`/api/invoices/${id}/submit`, { method: 'POST' })
    router.push('/talent/invoices')
  }

  if (loading) return <div className='p-4'>読み込み中...</div>
  if (!invoice) return <div className='p-4'>データがありません</div>

  const total = Number(invoice.amount)

  return (
    <main className='p-6 space-y-4'>
      <h1 className='text-xl font-bold'>請求内容の確認</h1>
      <Table>
        <TableBody>
          <TableRow>
            <TableCell className='font-medium'>報酬</TableCell>
            <TableCell>
              {invoice.status === 'draft' ? (
                <Input type='number' value={amount} onChange={e => setAmount(e.target.value)} />
              ) : (
                <>¥{invoice.amount.toLocaleString()}</>
              )}
            </TableCell>
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
      {invoice.status === 'draft' && (
        <>
          <div>
            <label className='block mb-2'>メモ (任意)</label>
            <Textarea value={memo} onChange={e => setMemo(e.target.value)} />
          </div>
          <p className='text-sm text-gray-500'>目安価格: ¥{invoice.offers?.reward?.toLocaleString?.() ?? 0}</p>
          <Button onClick={handleSubmit}>請求を確定する</Button>
        </>
      )}
    </main>
  )
}
