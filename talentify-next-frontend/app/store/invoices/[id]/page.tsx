'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'

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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase.from('invoices').select('*').eq('id', id).maybeSingle()
      if (!error) setInvoice(data)
      setLoading(false)
    }
    load()
  }, [id])

  const handleApprove = async () => {
    await supabase.from('invoices').update({ status: 'approved' }).eq('id', id)
    router.push('/store/invoices')
  }

  const handleReject = async () => {
    await supabase.from('invoices').update({ status: 'rejected' }).eq('id', id)
    router.push('/store/invoices')
  }

  if (loading) return <div className='p-4'>読み込み中...</div>
  if (!invoice) return <div className='p-4'>データがありません</div>

  const total = Number(invoice.amount) + Number(invoice.transportation_cost || 0)

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
            <TableCell className='font-medium'>交通費</TableCell>
            <TableCell>¥{(invoice.transportation_cost ?? 0).toLocaleString()}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className='font-medium'>備考</TableCell>
            <TableCell>{invoice.memo}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className='font-medium'>振込先</TableCell>
            <TableCell>{invoice.bank_account}</TableCell>
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
    </main>
  )
}
