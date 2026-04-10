'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

const statusLabels: Record<string, string> = {
  pending: '保留中',
  confirmed: '承諾済',
  canceled: 'キャンセル済み',
  rejected: '拒否',
  completed: '来店完',
  expired: '期限切れ',
}

const statusVariants: Record<string, Parameters<typeof Badge>[0]['variant']> = {
  pending: 'outline',
  confirmed: 'outline',
  canceled: 'outline',
  rejected: 'outline',
  completed: 'outline',
  expired: 'outline',
}

const statusToneClasses: Record<string, string> = {
  pending: 'border-[#e2e8f0] bg-white text-[#64748b]',
  confirmed: 'border-[#2f4da0]/35 bg-[#eef2ff] text-[#2f4da0]',
  canceled: 'border-[#7f1d1d]/35 bg-[#fef2f2] text-[#7f1d1d]',
  rejected: 'border-[#7f1d1d]/35 bg-[#fef2f2] text-[#7f1d1d]',
  completed: 'border-[#1f6b4f]/35 bg-[#ecfdf3] text-[#1f6b4f]',
  expired: 'border-[#7f1d1d]/35 bg-[#fef2f2] text-[#7f1d1d]',
}

type OfferTab = 'active' | 'history' | 'cancel'
const CANCEL_STATUSES = new Set(['canceled', 'rejected', 'expired'])

export default function StoreOffersPage() {
  const router = useRouter()
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [tab, setTab] = useState<OfferTab>('active')

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

  const filtered = useMemo(() => {
    const isCanceled = (status: string | null) => CANCEL_STATUSES.has(status ?? '')
    const isHistory = (offer: (typeof sorted)[number]) =>
      !isCanceled(offer.status) && offer.steps.every(step => step.status === 'complete')

    if (tab === 'history') {
      return sorted.filter(isHistory)
    }
    if (tab === 'cancel') {
      return sorted.filter(o => isCanceled(o.status))
    }
    return sorted.filter(o => !isCanceled(o.status) && !isHistory(o))
  }, [sorted, tab])

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

  const handleRowClick = (offerId: string) => {
    router.push(`/store/offers/${offerId}`)
  }

  return (
    <main className="space-y-4 bg-[#f8fafc] p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold text-[#334155]">オファー管理</h1>
        <p className="mt-1 text-sm text-[#64748b]">来店予定・進捗状況を一覧で確認できます。</p>
      </div>
      <Tabs value={tab} onValueChange={value => setTab(value as OfferTab)}>
        <TabsList className="h-auto rounded-none border-b border-slate-200 bg-transparent p-0">
          <TabsTrigger
            value="active"
            className="relative rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 text-sm font-semibold text-[#64748b] transition-colors hover:text-[#334155] data-[state=active]:border-[#2f4da0] data-[state=active]:text-[#2f4da0] data-[state=active]:shadow-none"
          >
            進行中
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="relative rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 text-sm font-semibold text-[#64748b] transition-colors hover:text-[#334155] data-[state=active]:border-[#2f4da0] data-[state=active]:text-[#2f4da0] data-[state=active]:shadow-none"
          >
            履歴
          </TabsTrigger>
          <TabsTrigger
            value="cancel"
            className="relative rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 text-sm font-semibold text-[#64748b] transition-colors hover:text-[#334155] data-[state=active]:border-[#2f4da0] data-[state=active]:text-[#2f4da0] data-[state=active]:shadow-none"
          >
            キャンセル
          </TabsTrigger>
        </TabsList>
      </Tabs>
      {loading ? (
        <TableSkeleton rows={3} />
      ) : filtered.length === 0 ? (
        <EmptyState title="対象のオファーがありません" />
      ) : (
        <>
          <section className="hidden overflow-x-auto rounded-xl border border-[#e2e8f0] bg-white shadow-sm md:block">
            <Table>
              <TableHeader className="sticky top-0 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90">
                <TableRow className="h-11 border-b border-[#e2e8f0] text-sm">
                  <TableHead className="w-[180px] px-6 text-xs font-semibold tracking-wide text-[#334155]" aria-sort={sortOrder === 'asc' ? 'ascending' : 'descending'}>
                    <button
                      type="button"
                      onClick={toggleSortOrder}
                      className="inline-flex items-center gap-1 font-semibold text-[#334155] transition-colors hover:text-[#2f4da0]"
                    >
                      来店日
                      {sortOrder === 'asc' ? (
                        <ChevronUp className="h-4 w-4 text-[#2f4da0]" aria-hidden="true" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-[#2f4da0]" aria-hidden="true" />
                      )}
                      <span className="sr-only">来店日で並び替え</span>
                    </button>
                  </TableHead>
                  <TableHead className="min-w-[220px] px-4 text-xs font-semibold tracking-wide text-[#334155]">演者名</TableHead>
                  <TableHead className="w-[150px] px-4 text-xs font-semibold tracking-wide text-[#334155]">現在ステータス</TableHead>
                  <TableHead className="min-w-[360px] px-4 text-xs font-semibold tracking-wide text-[#334155]">進捗</TableHead>
                  <TableHead className="w-[120px] px-6 text-right text-xs font-semibold tracking-wide text-[#334155]">詳細</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(o => (
                  <TableRow
                    key={o.id}
                    className="h-[68px] cursor-pointer border-b border-[#e2e8f0] transition-colors hover:bg-[#f8fafc]"
                    onClick={() => handleRowClick(o.id)}
                  >
                    <TableCell className="px-6 align-middle">
                      <div className="font-medium text-[#334155]">{formatVisitDate(o.date)}</div>
                    </TableCell>
                    <TableCell className="px-4 align-middle">
                      <div className="truncate text-[#334155]" title={o.talent_name ?? ''}>{o.talent_name ?? '-'}</div>
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
                      {CANCEL_STATUSES.has(o.status ?? '') ? (
                        <Badge variant="outline" className="border-[#7f1d1d]/35 bg-[#fef2f2] px-2.5 py-1 font-semibold text-[#7f1d1d]">
                          キャンセル済み
                        </Badge>
                      ) : (
                        <OfferProgressStatusIcons steps={o.steps} badge={o.badge} />
                      )}
                    </TableCell>
                    <TableCell className="px-6 align-middle text-right">
                      <Button variant="ghost" size="sm" asChild className="text-[#2f4da0] hover:bg-[#eef2ff] hover:text-[#233a7a]">
                        <Link href={`/store/offers/${o.id}`} className="inline-flex items-center gap-1" onClick={event => event.stopPropagation()}>
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
            {filtered.map(o => (
              <div
                key={o.id}
                className="space-y-3 rounded-2xl border border-[#e2e8f0] bg-white p-4 shadow-sm transition-colors hover:bg-[#f8fafc]"
                onClick={() => handleRowClick(o.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-[#334155]">{formatVisitDate(o.date)}</div>
                  <Badge variant={statusVariants[o.status ?? 'pending']} className={`rounded-md px-2.5 py-1 text-[11px] font-semibold ${statusToneClasses[o.status ?? 'pending'] ?? statusToneClasses.pending}`}>
                    {statusLabels[o.status ?? 'pending']}
                  </Badge>
                </div>
                <div className="text-base font-semibold text-[#334155]" title={o.talent_name ?? ''}>
                  {o.talent_name ?? '-'}
                </div>
                <div className="-mx-1 overflow-x-auto">
                  {CANCEL_STATUSES.has(o.status ?? '') ? (
                    <div className="mx-1">
                      <Badge variant="outline" className="border-[#7f1d1d]/35 bg-[#fef2f2] px-2.5 py-1 font-semibold text-[#7f1d1d]">
                        キャンセル済み
                      </Badge>
                    </div>
                  ) : (
                    <OfferProgressStatusIcons steps={o.steps} badge={o.badge} className="mx-1 min-w-[420px]" />
                  )}
                </div>
                <div className="flex justify-end">
                  <Button variant="ghost" size="sm" asChild className="text-[#2f4da0] hover:bg-[#eef2ff] hover:text-[#233a7a]">
                    <Link href={`/store/offers/${o.id}`} className="inline-flex items-center gap-1" onClick={event => event.stopPropagation()}>
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
