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
    <main className='min-h-screen bg-gray-100 px-3 py-5 sm:px-4 sm:py-8'>
      <div className='mx-auto w-full max-w-5xl'>
        <h1 className='mb-4 text-2xl font-bold tracking-tight sm:mb-6 sm:text-3xl'>請求一覧</h1>
        <section className='rounded-2xl border border-gray-200 bg-white p-3 shadow-sm sm:p-6'>
          {loading ? (
            <TableSkeleton rows={3} />
          ) : invoices.length === 0 ? (
            <EmptyState title='まだ請求がありません' />
          ) : (
            <>
              <div className='space-y-3 md:hidden'>
                {invoices.map(inv => (
                  <article key={inv.id} className='rounded-xl border border-slate-200 bg-white p-4'>
                    <div className='flex items-start justify-between gap-3'>
                      <div className='min-w-0'>
                        <p className='text-xs text-slate-500'>作成日</p>
                        <p className='mt-1 break-words text-sm font-semibold'>{formatJaDateTimeWithWeekday(inv.created_at ?? '')}</p>
                      </div>
                      <p className='shrink-0 text-lg font-bold'>¥{inv.amount.toLocaleString('ja-JP')}</p>
                    </div>
                    <div className='mt-3 flex flex-wrap gap-2'>
                      {renderStatus(inv)}
                      {renderPaymentStatus(inv)}
                    </div>
                    <div className='mt-4 flex gap-2'>
                      {inv.invoice_url && (
                        <Button size='sm' variant='outline' asChild className='min-h-10 flex-1'>
                          <Link href={`/api/invoices/${inv.id}/attachment`} target='_blank'>PDF</Link>
                        </Button>
                      )}
                      <Button size='sm' asChild className='min-h-10 flex-1'>
                        <Link href={`/store/invoices/${inv.id}`}>詳細</Link>
                      </Button>
                    </div>
                  </article>
                ))}
              </div>
              <div className='hidden overflow-x-auto md:block'>
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
                            <Link href={`/api/invoices/${inv.id}/attachment`} target='_blank'>
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
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  )
}
