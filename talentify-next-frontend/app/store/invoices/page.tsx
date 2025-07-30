'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getInvoicesForStore, type Invoice } from '@/utils/getInvoicesForStore'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { TableSkeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { Button } from '@/components/ui/button'

const statusLabels: Record<string, string> = {
  draft: '下書き',
  submitted: '請求済み',
  approved: '承認済み',
  paid: '支払完了',
  rejected: '差し戻し',
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
                <TableCell>{inv.created_at?.slice(0,10)}</TableCell>
                <TableCell>￥{inv.amount.toLocaleString()}</TableCell>
                <TableCell>{statusLabels[inv.status]}</TableCell>
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
