'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getInvoicesForStore, type Invoice } from '@/utils/getInvoicesForStore'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { TableSkeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatJaDateTimeWithWeekday } from '@/utils/formatJaDateTimeWithWeekday'

function renderStatus(inv: Invoice) {
  if (inv.offers?.paid) {
    return <Badge variant='success'>支払い完了</Badge>
  }
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

export default function StoreInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getInvoicesForStore().then(data => {
      setInvoices(data)
      setLoading(false)
    })
  }, [])

  return (
    <main className='p-6 space-y-4'>
      <h1 className='text-xl font-bold'>請求一覧</h1>
      {loading ? (
        <TableSkeleton rows={3} />
      ) : invoices.length === 0 ? (
        <EmptyState title='まだ請求がありません' />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>作成日</TableHead>
              <TableHead>金額</TableHead>
              <TableHead>ステータス</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map(inv => (
              <TableRow key={inv.id}>
                <TableCell>{formatJaDateTimeWithWeekday(inv.created_at ?? '')}</TableCell>
                <TableCell>¥{inv.amount.toLocaleString()}</TableCell>
                <TableCell>{renderStatus(inv)}</TableCell>
                <TableCell>
                  <Button size='sm' asChild>
                    <Link href={`/store/invoices/${inv.id}`}>詳細</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </main>
  )
}
