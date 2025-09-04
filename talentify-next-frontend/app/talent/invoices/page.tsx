'use client'

import { useEffect, useState } from 'react'
import { getInvoicesForTalent, type Invoice } from '@/utils/getInvoicesForTalent'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { TableSkeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { formatJaDateTimeWithWeekday } from '@/utils/formatJaDateTimeWithWeekday'

const statusLabels: Record<string, string> = {
  draft: '下書き',
  approved: '提出済み',
  submitted: '提出済み',
  paid: '支払完了',
  rejected: '差し戻し',
}

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
              <TableHead>ステータス</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map(inv => (
              <TableRow key={inv.id}>
                <TableCell>{formatJaDateTimeWithWeekday(inv.created_at ?? '')}</TableCell>
                <TableCell>¥{inv.amount.toLocaleString()}</TableCell>
                <TableCell>{statusLabels[inv.status]}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </main>
  )
}
