'use client'

import { useCallback, useEffect, useState } from 'react'
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
import { AlertCircle, RotateCcw } from 'lucide-react'

export default function TalentInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)

  const loadInvoices = useCallback(async () => {
    setLoading(true)
    setLoadError(false)

    try {
      const data = await getInvoicesForTalent()
      setInvoices(data)
    } catch (error) {
      console.error('failed to load talent invoices', error)
      setLoadError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadInvoices()
  }, [loadInvoices])

  return (
    <main className='space-y-4 p-3 sm:p-6'>
      <h1 className='text-xl font-bold'>請求履歴</h1>
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
          description='見積を作成・提出すると、ここで見積や請求の履歴を確認できます。'
        />
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
          </div>
        </>
      )}
    </main>
  )
}
