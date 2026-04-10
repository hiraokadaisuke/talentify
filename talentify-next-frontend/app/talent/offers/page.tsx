'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getOffersForTalent, TalentOffer } from '@/utils/getOffersForTalent'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { TableSkeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { toast } from 'sonner'
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
  pending: 'border-[#a15c00]/45 bg-[#fff3e2] text-[#a15c00]',
  confirmed: 'border-[#2f4da0]/45 bg-[#e9eefc] text-[#2f4da0]',
  rejected: 'border-[#64748b]/45 bg-[#f1f5f9] text-[#64748b]',
  completed: 'border-[#1f6b4f]/45 bg-[#e8f5ef] text-[#1f6b4f]',
  expired: 'border-[#64748b]/45 bg-[#f1f5f9] text-[#64748b]',
}

type OfferTab = 'active' | 'history' | 'cancel'

export default function TalentOffersPage() {
  const router = useRouter()
  const [offers, setOffers] = useState<TalentOffer[]>([])
  const [loading, setLoading] = useState(true)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [tab, setTab] = useState<OfferTab>('active')

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getOffersForTalent()
        setOffers(data)
      } catch (e) {
        console.error('failed to load offers', e)
        toast.error('オファーの取得に失敗しました')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const offersWithProgress = useMemo(() => {
    return offers.map(offer => {
      const { steps, badge } = getOfferProgress({
        status: offer.status ?? 'pending',
        invoiceStatus: offer.invoice_status,
        paid: Boolean(offer.paid),
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
    if (tab === 'history') {
      return sorted.filter(o => o.badge.label === '支払い済み' || o.badge.label === '来店完了')
    }
    if (tab === 'cancel') {
      return sorted.filter(o => o.status === 'rejected' || o.status === 'expired')
    }
    return sorted.filter(o => ['承認待ち', '承認済み', '来店予定', 'レビュー待ち'].includes(o.badge.label))
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
    router.push(`/talent/offers/${offerId}`)
  }

  return (
    <main className="space-y-4 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">オファー管理</h1>
        <p className="mt-1 text-sm text-slate-500">受信したオファーと進捗を一覧で確認できます。</p>
      </div>
      <Tabs value={tab} onValueChange={value => setTab(value as OfferTab)}>
        <TabsList className="h-11 bg-slate-100 p-1">
          <TabsTrigger value="active" className="data-[state=active]:bg-white">進行中</TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-white">履歴</TabsTrigger>
          <TabsTrigger value="cancel" className="data-[state=active]:bg-white">キャンセル</TabsTrigger>
        </TabsList>
      </Tabs>
      {loading ? (
        <TableSkeleton rows={3} />
      ) : filtered.length === 0 ? (
        <EmptyState title="対象のオファーがありません" />
      ) : (
        <>
          <section className="hidden overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm md:block">
            <Table>
              <TableHeader className="sticky top-0 bg-slate-100/95">
                <TableRow className="h-11 border-b border-slate-300 text-sm">
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
                  <TableHead className="min-w-[220px] px-4 text-xs font-semibold tracking-wide text-slate-600">店舗名</TableHead>
                  <TableHead className="w-[150px] px-4 text-xs font-semibold tracking-wide text-slate-600">現在ステータス</TableHead>
                  <TableHead className="min-w-[360px] px-4 text-xs font-semibold tracking-wide text-slate-600">進捗</TableHead>
                  <TableHead className="w-[120px] px-6 text-right text-xs font-semibold tracking-wide text-slate-600">詳細</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(o => (
                  <TableRow
                    key={o.id}
                    className="h-[68px] cursor-pointer border-b border-slate-300 transition-colors hover:bg-slate-100"
                    onClick={() => handleRowClick(o.id)}
                  >
                    <TableCell className="px-6 align-middle">
                      <div className="font-medium text-slate-900">{formatVisitDate(o.date)}</div>
                    </TableCell>
                    <TableCell className="px-4 align-middle">
                      <div className="truncate text-slate-900" title={o.store_name ?? ''}>
                        {o.store_name ?? '-'}
                      </div>
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
                        <Link href={`/talent/offers/${o.id}`} className="inline-flex items-center gap-1" onClick={event => event.stopPropagation()}>
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
                className="space-y-3 rounded-2xl border border-slate-300 bg-white p-4 shadow-sm transition-colors hover:bg-slate-100"
                onClick={() => handleRowClick(o.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-slate-900">{formatVisitDate(o.date)}</div>
                  <Badge variant={statusVariants[o.status ?? 'pending']} className={`rounded-md px-2.5 py-1 text-[11px] font-semibold ${statusToneClasses[o.status ?? 'pending'] ?? statusToneClasses.pending}`}>
                    {statusLabels[o.status ?? 'pending']}
                  </Badge>
                </div>
                <div className="text-base font-semibold text-slate-900" title={o.store_name ?? ''}>
                  {o.store_name ?? '-'}
                </div>
                <div className="-mx-1 overflow-x-auto">
                  <OfferProgressStatusIcons steps={o.steps} badge={o.badge} className="mx-1 min-w-[420px]" />
                </div>
                <div className="flex justify-end">
                  <Button variant="ghost" size="sm" asChild className="text-blue-700 hover:bg-blue-50 hover:text-blue-800">
                    <Link href={`/talent/offers/${o.id}`} className="inline-flex items-center gap-1" onClick={event => event.stopPropagation()}>
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
