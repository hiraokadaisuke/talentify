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
import { getInvoiceStatusLabel, getPaymentStatusLabel } from '@/lib/invoices/status'

function renderStatus(inv: Invoice) {
  return <Badge variant='secondary'>{getInvoiceStatusLabel(inv.status)}</Badge>
}

function renderPaymentStatus(inv: Invoice) {
  return (
    <Badge variant={inv.offers?.paid ? 'success' : 'outline'}>
      {getPaymentStatusLabel(inv.payment_status, inv.offers?.paid)}
    </Badge>
  )
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
    <main className='min-h-screen bg-gray-100 p-6'>
      <div className='max-w-4xl mx-auto space-y-4'>
        <h1 className='text-xl font-bold'>請求一覧</h1>
        <section className='rounded-2xl border border-gray-200 bg-white p-6 shadow-sm'>
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
                  <TableRow key={inv.id} className='hover:bg-gray-50'>
                    <TableCell>{formatJaDateTimeWithWeekday(inv.created_at ?? '')}</TableCell>
                    <TableCell>¥{inv.amount.toLocaleString('ja-JP')}</TableCell>
                    <TableCell>{renderStatus(inv)}</TableCell>
                    <TableCell>{renderPaymentStatus(inv)}</TableCell>
                    <TableCell>
                      <div className='flex gap-2'>
                        {inv.invoice_url && (
                          <Button size='sm' variant='outline' asChild>
                            <Link href={inv.invoice_url} target='_blank'>
                              PDF
                            </Link>
                          </Button>
                        )}
                        <Button size='sm' asChild>
                          <Link href={`/store/invoices/${inv.id}`}>詳細</Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </section>
      </div>
    </main>
  )
}
