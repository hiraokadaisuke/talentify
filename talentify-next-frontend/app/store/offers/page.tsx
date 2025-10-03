'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { getOffersForStore, Offer } from '@/utils/getOffersForStore'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { TableSkeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { getOfferProgress } from '@/utils/offerProgress'
import { OfferProgressStatusIcons } from '@/components/offer/OfferProgressStatusIcons'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const statusLabels: Record<string, string> = {
  pending: '保留中',
  confirmed: '承諾済',
  rejected: '拒否',
  completed: '来店完',
  expired: '期限切れ',
}

const statusVariants: Record<string, Parameters<typeof Badge>[0]['variant']> = {
  pending: 'secondary',
  confirmed: 'default',
  rejected: 'destructive',
  completed: 'success',
  expired: 'secondary',
}

export default function StoreOffersPage() {
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    const load = async () => {
      const data = await getOffersForStore()
      setOffers(data)
      setLoading(false)
    }
    load()
  }, [])

  const offersWithProgress = useMemo(() => {
    return offers.map(offer => {
      const { steps, badge } = getOfferProgress({
        status: offer.status ?? 'pending',
        invoiceStatus: offer.invoice_status,
        paid: Boolean(offer.paid),
        reviewCompleted: offer.review_completed,
      })

      return {
        ...offer,
        steps,
        badge,
      }
    })
  }, [offers])

  const sorted = useMemo(() => {
    return [...offersWithProgress].sort((a, b) => {
      const aTime = a.date ? new Date(a.date).getTime() : sortOrder === 'asc' ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY
      const bTime = b.date ? new Date(b.date).getTime() : sortOrder === 'asc' ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY

      if (sortOrder === 'asc') {
        return aTime - bTime
      }
      return bTime - aTime
    })
  }, [offersWithProgress, sortOrder])

  const toggleSortOrder = () => {
    setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))
  }

  const formatVisitDate = (value: string | null) => {
    if (!value) return '未定'
    try {
      return format(new Date(value), 'yyyy/MM/dd (EEE)', { locale: ja })
    } catch (error) {
      console.error('failed to format visit date', error)
      return '未定'
    }
  }

  return (
    <main className="p-4 md:p-6 space-y-4">
      <h1 className="text-xl font-bold">オファー一覧</h1>
      {loading ? (
        <TableSkeleton rows={3} />
      ) : sorted.length === 0 ? (
        <EmptyState title="対象のオファーがありません" />
      ) : (
        <>
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-white">
                <TableRow className="text-sm">
                  <TableHead className="w-[160px]" aria-sort={sortOrder === 'asc' ? 'ascending' : 'descending'}>
                    <button
                      type="button"
                      onClick={toggleSortOrder}
                      className="inline-flex items-center gap-1 font-semibold text-slate-700 hover:text-[#2563EB]"
                    >
                      来店日
                      {sortOrder === 'asc' ? (
                        <ChevronUp className="h-4 w-4 text-[#2563EB]" aria-hidden="true" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-[#2563EB]" aria-hidden="true" />
                      )}
                      <span className="sr-only">来店日で並び替え</span>
                    </button>
                  </TableHead>
                  <TableHead className="min-w-[200px]">演者名</TableHead>
                  <TableHead className="min-w-[320px]">オファー進捗</TableHead>
                  <TableHead className="w-[120px] text-right">詳細</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map(o => (
                  <TableRow key={o.id} className="h-16 transition-colors hover:bg-slate-100/70">
                    <TableCell className="align-middle">
                      <div className="font-medium text-slate-900">{formatVisitDate(o.date)}</div>
                    </TableCell>
                    <TableCell className="align-middle">
                      <div className="truncate text-slate-900" title={o.talent_name ?? ''}>{o.talent_name ?? '-'}</div>
                    </TableCell>
                    <TableCell className="align-middle">
                      <OfferProgressStatusIcons steps={o.steps} badge={o.badge} />
                    </TableCell>
                    <TableCell className="align-middle text-right">
                      <Button variant="ghost" size="sm" asChild className="text-[#2563EB] hover:bg-[#2563EB]/10">
                        <Link href={`/store/offers/${o.id}`}>詳細</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="md:hidden space-y-3">
            {sorted.map(o => (
              <div key={o.id} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-slate-900">{formatVisitDate(o.date)}</div>
                  <Badge variant={statusVariants[o.status ?? 'pending']}>
                    {statusLabels[o.status ?? 'pending']}
                  </Badge>
                </div>
                <div className="text-base font-semibold text-slate-900" title={o.talent_name ?? ''}>
                  {o.talent_name ?? '-'}
                </div>
                <div className="-mx-1 overflow-x-auto">
                  <OfferProgressStatusIcons steps={o.steps} badge={o.badge} className="mx-1 min-w-[420px]" />
                </div>
                <div className="flex justify-end">
                  <Button variant="ghost" size="sm" asChild className="text-[#2563EB] hover:bg-[#2563EB]/10">
                    <Link href={`/store/offers/${o.id}`}>詳細</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  )
}
