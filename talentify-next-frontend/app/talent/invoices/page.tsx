'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getInvoicesForTalent, type Invoice } from '@/utils/getInvoicesForTalent'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { TableSkeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { formatJaDateTimeWithWeekday } from '@/utils/formatJaDateTimeWithWeekday'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getInvoiceStatusLabel, getPaymentStatusLabel } from '@/lib/invoices/status'

export default function TalentInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getInvoicesForTalent().then(data => {
      setInvoices(data)
      setLoading(false)
    })
  }, [])

  return (
    <main className='p-6 space-y-4'>
      <h1 className='text-xl font-bold'>請求履歴</h1>
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
              <TableHead>請求書ステータス</TableHead>
              <TableHead>支払い状態</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map(inv => (
              <TableRow key={inv.id}>
                <TableCell>{formatJaDateTimeWithWeekday(inv.created_at ?? '')}</TableCell>
                <TableCell>¥{inv.amount.toLocaleString()}</TableCell>
                <TableCell>
                  <Badge variant='outline'>{getInvoiceStatusLabel(inv.status)}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={inv.payment_status === 'paid' ? 'success' : 'secondary'}>
                    {getPaymentStatusLabel(inv.payment_status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button size='sm' asChild>
                    <Link href={`/talent/invoices/${inv.id}`}>詳細</Link>
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
