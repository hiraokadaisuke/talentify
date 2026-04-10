'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { getOffersForStore, Offer } from '@/utils/getOffersForStore'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { TableSkeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { ChevronDown, ChevronRight, ChevronUp } from 'lucide-react'
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
  pending: 'outline',
  confirmed: 'outline',
  rejected: 'outline',
  completed: 'outline',
  expired: 'outline',
}

const statusToneClasses: Record<string, string> = {
  pending: 'border-amber-200 bg-amber-50 text-amber-800',
  confirmed: 'border-blue-200 bg-blue-50 text-blue-800',
  rejected: 'border-rose-200 bg-rose-50 text-rose-800',
  completed: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  expired: 'border-slate-200 bg-slate-100 text-slate-700',
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
    <main className="space-y-4 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">オファー管理</h1>
        <p className="mt-1 text-sm text-slate-500">来店予定・進捗状況を一覧で確認できます。</p>
      </div>
      {loading ? (
        <TableSkeleton rows={3} />
      ) : sorted.length === 0 ? (
        <EmptyState title="対象のオファーがありません" />
      ) : (
        <>
          <section className="hidden overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm md:block">
            <Table>
              <TableHeader className="sticky top-0 bg-slate-50">
                <TableRow className="h-12 border-b border-slate-200 text-sm">
                  <TableHead className="w-[180px] px-6 text-xs font-semibold tracking-wide text-slate-600" aria-sort={sortOrder === 'asc' ? 'ascending' : 'descending'}>
                    <button
                      type="button"
                      onClick={toggleSortOrder}
                      className="inline-flex items-center gap-1 font-semibold text-slate-700 hover:text-blue-700"
                    >
                      来店日
                      {sortOrder === 'asc' ? (
                        <ChevronUp className="h-4 w-4 text-blue-700" aria-hidden="true" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-blue-700" aria-hidden="true" />
                      )}
                      <span className="sr-only">来店日で並び替え</span>
                    </button>
                  </TableHead>
                  <TableHead className="min-w-[220px] px-4 text-xs font-semibold tracking-wide text-slate-600">演者名</TableHead>
                  <TableHead className="w-[150px] px-4 text-xs font-semibold tracking-wide text-slate-600">現在ステータス</TableHead>
                  <TableHead className="min-w-[360px] px-4 text-xs font-semibold tracking-wide text-slate-600">進捗</TableHead>
                  <TableHead className="w-[120px] px-6 text-right text-xs font-semibold tracking-wide text-slate-600">詳細</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map(o => (
                  <TableRow key={o.id} className="h-[76px] border-b border-slate-100 transition-colors hover:bg-slate-50/80">
                    <TableCell className="px-6 align-middle">
                      <div className="font-medium text-slate-900">{formatVisitDate(o.date)}</div>
                    </TableCell>
                    <TableCell className="px-4 align-middle">
                      <div className="truncate text-slate-900" title={o.talent_name ?? ''}>{o.talent_name ?? '-'}</div>
                    </TableCell>
                    <TableCell className="px-4 align-middle">
                      <Badge
                        variant={statusVariants[o.status ?? 'pending']}
                        className={`rounded-md px-2.5 py-1 text-[11px] font-semibold ${statusToneClasses[o.status ?? 'pending'] ?? statusToneClasses.pending}`}
                      >
                        {statusLabels[o.status ?? 'pending']}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 align-middle">
                      <OfferProgressStatusIcons steps={o.steps} badge={o.badge} />
                    </TableCell>
                    <TableCell className="px-6 align-middle text-right">
                      <Button variant="ghost" size="sm" asChild className="text-blue-700 hover:bg-blue-50 hover:text-blue-800">
                        <Link href={`/store/offers/${o.id}`} className="inline-flex items-center gap-1">
                          詳細
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </section>

          <div className="md:hidden space-y-3">
            {sorted.map(o => (
              <div key={o.id} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-slate-900">{formatVisitDate(o.date)}</div>
                  <Badge variant={statusVariants[o.status ?? 'pending']} className={`rounded-md px-2.5 py-1 text-[11px] font-semibold ${statusToneClasses[o.status ?? 'pending'] ?? statusToneClasses.pending}`}>
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
                  <Button variant="ghost" size="sm" asChild className="text-blue-700 hover:bg-blue-50 hover:text-blue-800">
                    <Link href={`/store/offers/${o.id}`} className="inline-flex items-center gap-1">
                      詳細
                      <ChevronRight className="h-4 w-4" />
                    </Link>
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
