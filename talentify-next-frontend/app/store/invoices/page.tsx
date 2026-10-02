'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { getInvoicesForStore, type Invoice } from '@/utils/getInvoicesForStore'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { TableSkeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatJaDateTimeWithWeekday } from '@/utils/formatJaDateTimeWithWeekday'
import { getInvoiceStatusLabel, getPaymentStatusLabel } from '@/lib/invoices/status'
import { AlertCircle, ReceiptText, RotateCcw } from 'lucide-react'

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
  const [loadError, setLoadError] = useState(false)

  const loadInvoices = useCallback(async () => {
    setLoading(true)
    setLoadError(false)

    try {
      const data = await getInvoicesForStore()
      setInvoices(data)
    } catch (error) {
      console.error('failed to load store invoices', error)
      setLoadError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadInvoices()
  }, [loadInvoices])

  return (
    <main className='mx-auto w-full max-w-[1500px] space-y-4'>
      <section className='overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,.05)]'>
        <div className='flex items-start gap-3 p-5 sm:p-6'>
          <span className='grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#0B1F3B] text-[#FFC400]'>
            <ReceiptText className='h-5 w-5' />
          </span>
          <div>
            <p className='text-[11px] font-black tracking-[0.16em] text-[#C2410C]'>ESTIMATES & INVOICES</p>
            <h1 className='mt-1 text-2xl font-black tracking-tight text-slate-950'>見積・請求</h1>
            <p className='mt-1 text-sm leading-6 text-slate-500'>提出された見積、締結書兼請求書、支払い状況をまとめて確認できます。</p>
          </div>
        </div>
        <div className='h-1 bg-gradient-to-r from-[#FF3B2E] via-[#FF8A00] to-[#FFC400]' />
      </section>
      <section className='rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_8px_24px_rgba(15,23,42,.05)] sm:p-5'>
          {loading ? (
            <TableSkeleton rows={3} />
          ) : loadError ? (
            <div
              role='alert'
              className='rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-center'
            >
              <AlertCircle className='mx-auto h-6 w-6 text-red-600' aria-hidden='true' />
              <h2 className='mt-2 text-sm font-semibold text-red-900'>
                請求情報を読み込めませんでした
              </h2>
              <p className='mt-1 text-xs leading-relaxed text-red-700'>
                通信状況を確認して、もう一度お試しください。
              </p>
              <button
                type='button'
                onClick={() => void loadInvoices()}
                className='mt-4 inline-flex min-h-10 items-center gap-2 rounded-md border border-red-200 bg-white px-4 text-sm font-semibold text-red-800 transition hover:bg-red-100'
              >
                <RotateCcw className='h-4 w-4' aria-hidden='true' />
                再読み込み
              </button>
            </div>
          ) : invoices.length === 0 ? (
            <EmptyState
              title='まだ請求がありません'
              description='見積が提出・承認されると、ここで請求情報を確認できます。'
            />
          ) : (
            <>
              <div className='space-y-3 md:hidden'>
                {invoices.map(inv => (
                  <article key={inv.id} className='rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_8px_20px_rgba(15,23,42,.05)]'>
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
                        <Button size='sm' variant='outline' asChild className='min-h-10 flex-1 rounded-xl bg-[#FF5A1F] font-bold text-white hover:bg-[#E94F18]'>
                          <Link href={`/api/invoices/${inv.id}/attachment`} target='_blank'>PDF</Link>
                        </Button>
                      )}
                      <Button size='sm' asChild className='min-h-10 flex-1 rounded-xl bg-[#FF5A1F] font-bold text-white hover:bg-[#E94F18]'>
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
                  <TableRow key={inv.id} className='hover:bg-orange-50/40'>
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
                        <Button size='sm' asChild className='rounded-xl bg-[#FF5A1F] font-bold text-white hover:bg-[#E94F18]'>
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
    </main>
  )
}
