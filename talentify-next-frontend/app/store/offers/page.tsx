'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { ArrowUpDown, ChevronRight } from 'lucide-react'
import { getOffersForStore, Offer } from '@/utils/getOffersForStore'
import { getOfferProgress } from '@/utils/offerProgress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { TableSkeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { Badge } from '@/components/ui/badge'
import styles from './page.module.css'

const statusLabels: Record<string, string> = {
  pending: '保留中',
  confirmed: '承諾済',
  canceled: 'キャンセル済み',
  rejected: '拒否',
  completed: '来店完',
  expired: '期限切れ',
}

type OfferTab = 'active' | 'history' | 'cancel'
type SortKey = 'visit' | 'updated' | 'created'

const CANCEL_STATUSES = new Set(['canceled', 'rejected', 'expired'])

const badgeToneByCategory = {
  neutral: 'border-[#e2e8f0] bg-white text-[#64748b]',
  active: 'border-[#2f4da0]/35 bg-[#eef2ff] text-[#2f4da0]',
  success: 'border-[#1f6b4f]/35 bg-[#ecfdf3] text-[#1f6b4f]',
  danger: 'border-[#7f1d1d]/35 bg-[#fef2f2] text-[#7f1d1d]',
}

function formatDate(value: string | null, template = 'yyyy/MM/dd (EEE)') {
  if (!value) return '-'
  try {
    return format(new Date(value), template, { locale: ja })
  } catch {
    return '-'
  }
}

export default function StoreOffersPage() {
  const router = useRouter()
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<OfferTab>('active')
  const [searchWord, setSearchWord] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('visit')
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

      const isCanceled = CANCEL_STATUSES.has(offer.status ?? '')
      const isHistory = !isCanceled && steps.every(step => step.status === 'complete')

      return {
        ...offer,
        steps,
        badge,
        isCanceled,
        isHistory,
      }
    })
  }, [offers])

  const tabCounts = useMemo(() => {
    return {
      active: offersWithProgress.filter(o => !o.isCanceled && !o.isHistory).length,
      history: offersWithProgress.filter(o => o.isHistory).length,
      cancel: offersWithProgress.filter(o => o.isCanceled).length,
    }
  }, [offersWithProgress])

  const processed = useMemo(() => {
    let rows = offersWithProgress.filter(offer => {
      if (tab === 'history') return offer.isHistory
      if (tab === 'cancel') return offer.isCanceled
      return !offer.isHistory && !offer.isCanceled
    })

    if (searchWord.trim()) {
      const q = searchWord.toLowerCase()
      rows = rows.filter(o => (o.talent_name ?? '').toLowerCase().includes(q))
    }

    if (statusFilter !== 'all') {
      rows = rows.filter(o => (o.status ?? 'pending') === statusFilter)
    }

    if (dateFrom) {
      const from = new Date(dateFrom).getTime()
      rows = rows.filter(o => (o.date ? new Date(o.date).getTime() >= from : false))
    }

    if (dateTo) {
      const to = new Date(dateTo).getTime()
      rows = rows.filter(o => (o.date ? new Date(o.date).getTime() <= to : false))
    }

    rows.sort((a, b) => {
      const getTime = (value: string | null) => {
        if (!value) return sortOrder === 'asc' ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY
        return new Date(value).getTime()
      }

      const aTime = sortKey === 'created' ? getTime(a.created_at) : sortKey === 'updated' ? getTime(a.created_at) : getTime(a.date)
      const bTime = sortKey === 'created' ? getTime(b.created_at) : sortKey === 'updated' ? getTime(b.created_at) : getTime(b.date)

      return sortOrder === 'asc' ? aTime - bTime : bTime - aTime
    })

    return rows
  }, [dateFrom, dateTo, offersWithProgress, searchWord, sortKey, sortOrder, statusFilter, tab])

  const handleRowClick = (offerId: string) => {
    router.push(`/store/offers/${offerId}`)
  }

  return (
    <main className={`${styles.page} p-4 text-[#334155] md:p-6`}>
      <div className={`${styles.pageInner} mx-auto w-full max-w-7xl`}>
        <header>
          <h1 className="text-2xl font-bold">オファー管理</h1>
          <p className="mt-1 text-sm text-[#64748b]">来店予定・進捗状況を一覧で確認できます。</p>
        </header>

        <section className="space-y-3 rounded-xl border border-[#e2e8f0] bg-white p-3 shadow-sm md:p-4">
          <div className="flex flex-wrap gap-2 border-b border-[#e2e8f0] pb-2">
            {([
              { key: 'active', label: '進行中', count: tabCounts.active },
              { key: 'history', label: '履歴', count: tabCounts.history },
              { key: 'cancel', label: 'キャンセル', count: tabCounts.cancel },
            ] as const).map(item => (
              <button
                key={item.key}
                type="button"
                onClick={() => setTab(item.key)}
                className={`border-b-2 px-3 py-2 text-sm font-semibold transition-colors ${
                  tab === item.key
                    ? 'border-[#2f4da0] text-[#2f4da0]'
                    : 'border-transparent text-[#64748b] hover:text-[#334155]'
                }`}
              >
                {item.label}
                <span className="ml-1 text-xs">{item.count}</span>
              </button>
            ))}
          </div>

          <div className={styles.filterBar}>
            <label className="flex min-w-[180px] flex-1 flex-col gap-1 text-xs text-[#64748b]">
              演者名検索
              <input
                value={searchWord}
                onChange={event => setSearchWord(event.target.value)}
                className="h-9 rounded-md border border-[#e2e8f0] bg-white px-3 text-sm text-[#334155]"
                placeholder="演者名で検索"
              />
            </label>
            <label className="flex min-w-[140px] flex-col gap-1 text-xs text-[#64748b]">
              ステータス
              <select value={statusFilter} onChange={event => setStatusFilter(event.target.value)} className="h-9 rounded-md border border-[#e2e8f0] bg-white px-2 text-sm text-[#334155]">
                <option value="all">すべて</option>
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </label>
            <label className="flex min-w-[150px] flex-col gap-1 text-xs text-[#64748b]">
              開始日
              <input type="date" value={dateFrom} onChange={event => setDateFrom(event.target.value)} className="h-9 rounded-md border border-[#e2e8f0] bg-white px-2 text-sm text-[#334155]" />
            </label>
            <label className="flex min-w-[150px] flex-col gap-1 text-xs text-[#64748b]">
              終了日
              <input type="date" value={dateTo} onChange={event => setDateTo(event.target.value)} className="h-9 rounded-md border border-[#e2e8f0] bg-white px-2 text-sm text-[#334155]" />
            </label>
            <label className="flex min-w-[160px] flex-col gap-1 text-xs text-[#64748b]">
              並び替え
              <select value={sortKey} onChange={event => setSortKey(event.target.value as SortKey)} className="h-9 rounded-md border border-[#e2e8f0] bg-white px-2 text-sm text-[#334155]">
                <option value="visit">来店日</option>
                <option value="updated">更新日</option>
                <option value="created">作成日</option>
              </select>
            </label>
            <button type="button" onClick={() => setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))} className="inline-flex h-9 items-center gap-1 rounded-md border border-[#e2e8f0] bg-white px-3 text-sm font-medium text-[#334155] hover:bg-[#f1f5f9]">
              <ArrowUpDown className="h-4 w-4" />
              {sortOrder === 'asc' ? '昇順' : '降順'}
            </button>
          </div>

          {loading ? (
            <TableSkeleton rows={4} />
          ) : processed.length === 0 ? (
            <EmptyState title="対象のオファーがありません" />
          ) : (
            <>
              <section className="hidden overflow-x-auto rounded-xl border border-[#e2e8f0] md:block">
                <Table>
                  <TableHeader className="bg-white">
                    <TableRow className="h-11 border-b border-[#e2e8f0]">
                      <TableHead className="w-[160px] px-4 text-xs font-semibold text-[#334155]">来店日</TableHead>
                      <TableHead className="min-w-[180px] px-4 text-xs font-semibold text-[#334155]">演者名</TableHead>
                      <TableHead className="w-[130px] px-4 text-xs font-semibold text-[#334155]">現在ステータス</TableHead>
                      <TableHead className="min-w-[260px] px-4 text-xs font-semibold text-[#334155]">進捗</TableHead>
                      <TableHead className="w-[140px] px-4 text-xs font-semibold text-[#334155]">最終更新</TableHead>
                      <TableHead className="w-[90px] px-4 text-right text-xs font-semibold text-[#334155]">詳細</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {processed.map(o => (
                      <TableRow
                        key={o.id}
                        className="cursor-pointer border-b border-[#e2e8f0] hover:bg-[#f8fafc]"
                        onClick={() => handleRowClick(o.id)}
                        onKeyDown={event => {
                          if (event.key === 'Enter') handleRowClick(o.id)
                        }}
                        tabIndex={0}
                      >
                        <TableCell className="px-4">{formatDate(o.date)}</TableCell>
                        <TableCell className="px-4">
                          <p className="truncate" title={o.talent_name ?? ''}>{o.talent_name ?? '-'}</p>
                        </TableCell>
                        <TableCell className="px-4">
                          <Badge variant="outline" className={`rounded-md px-2 py-0.5 text-[11px] ${o.isCanceled ? badgeToneByCategory.danger : o.isHistory ? badgeToneByCategory.success : badgeToneByCategory.active}`}>
                            {statusLabels[o.status ?? 'pending'] ?? '保留中'}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-4">
                          {o.isCanceled ? (
                            <Badge variant="outline" className={`rounded-md px-2 py-0.5 text-[11px] ${badgeToneByCategory.danger}`}>キャンセル済み</Badge>
                          ) : (
                            <div className="space-y-1">
                              <p className="text-xs font-semibold text-[#334155]">{o.badge.label}</p>
                              <div className="flex gap-1.5">
                                {o.steps.map(step => (
                                  <span key={step.key} className={`h-1.5 flex-1 rounded-full ${step.status === 'complete' ? 'bg-[#1f6b4f]' : step.status === 'current' ? 'bg-[#2f4da0]' : 'bg-[#e2e8f0]'}`} />
                                ))}
                              </div>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="px-4 text-xs text-[#64748b]">{formatDate(o.created_at, 'yyyy/MM/dd HH:mm')}</TableCell>
                        <TableCell className="px-4 text-right">
                          <Link href={`/store/offers/${o.id}`} className="inline-flex items-center gap-1 text-sm font-medium text-[#2f4da0] hover:text-[#233a7a]" onClick={event => event.stopPropagation()}>
                            詳細
                            <ChevronRight className="h-4 w-4" />
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </section>

              <section className="space-y-3 md:hidden">
                {processed.map(o => (
                  <article
                    key={o.id}
                    className="cursor-pointer rounded-xl border border-[#e2e8f0] bg-white p-4 shadow-sm"
                    onClick={() => handleRowClick(o.id)}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">{formatDate(o.date)}</p>
                      <Badge variant="outline" className={`rounded-md px-2 py-0.5 text-[11px] ${o.isCanceled ? badgeToneByCategory.danger : o.isHistory ? badgeToneByCategory.success : badgeToneByCategory.active}`}>
                        {statusLabels[o.status ?? 'pending'] ?? '保留中'}
                      </Badge>
                    </div>
                    <p className="mt-2 text-base font-semibold">{o.talent_name ?? '-'}</p>
                    <p className="mt-2 text-xs font-semibold">{o.isCanceled ? 'キャンセル済み' : o.badge.label}</p>
                    {!o.isCanceled && (
                      <div className="mt-1 flex gap-1.5">
                        {o.steps.map(step => (
                          <span key={step.key} className={`h-1.5 flex-1 rounded-full ${step.status === 'complete' ? 'bg-[#1f6b4f]' : step.status === 'current' ? 'bg-[#2f4da0]' : 'bg-[#e2e8f0]'}`} />
                        ))}
                      </div>
                    )}
                    <div className="mt-3 flex items-center justify-between text-xs text-[#64748b]">
                      <span>最終更新: {formatDate(o.created_at, 'yyyy/MM/dd HH:mm')}</span>
                      <Link href={`/store/offers/${o.id}`} className="inline-flex items-center gap-1 font-medium text-[#2f4da0]" onClick={event => event.stopPropagation()}>
                        詳細
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </article>
                ))}
              </section>

              <p className="text-right text-xs text-[#64748b]">{processed.length} 件を表示中</p>
            </>
          )}
        </section>
      </div>
    </main>
  )
}
