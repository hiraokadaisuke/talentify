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
    <main className='space-y-4 p-3 sm:p-6'>
      <h1 className='text-xl font-bold'>見積・請求履歴</h1>
      {loading ? (
        <TableSkeleton rows={3} />
      ) : invoices.length === 0 ? (
        <EmptyState title='まだ請求がありません' />
      ) : (
        <>
          <div className='space-y-3 md:hidden'>
            {invoices.map(inv => (
              <article key={inv.id} className='rounded-xl border border-slate-200 bg-white p-4 shadow-sm'>
                <div className='flex items-start justify-between gap-3'>
                  <div className='min-w-0'>
                    <p className='text-xs text-slate-500'>作成日</p>
                    <p className='mt-1 break-words text-sm font-semibold'>{formatJaDateTimeWithWeekday(inv.created_at ?? '')}</p>
                  </div>
                  <p className='shrink-0 text-lg font-bold'>¥{inv.amount.toLocaleString('ja-JP')}</p>
                </div>
                <div className='mt-3 flex flex-wrap gap-2'>
                  <Badge variant='outline'>{getInvoiceStatusLabel(inv.status)}</Badge>
                  <Badge variant={inv.payment_status === 'paid' ? 'success' : 'secondary'}>
                    {getPaymentStatusLabel(inv.payment_status)}
                  </Badge>
                </div>
                <Button size='sm' asChild className='mt-4 min-h-10 w-full'>
                  <Link href={`/talent/invoices/${inv.id}`}>詳細を見る</Link>
                </Button>
              </article>
            ))}
          </div>
          <div className='hidden overflow-x-auto md:block'>
            <Table>
              <TableHeader>
            <TableRow>
              <TableHead>作成日</TableHead>
              <TableHead>金額</TableHead>
              <TableHead>見積・締結状態</TableHead>
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
          </div>
        </>
      )}
    </main>
  )
}
