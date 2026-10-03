'use client'

import { useCallback, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { AlertCircle, ArrowUpDown, ChevronDown, RotateCcw, SlidersHorizontal } from 'lucide-react'
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
  no_show: '来店なし',
  rejected: '辞退',
  completed: '来店完',
  expired: '期限切れ',
}

type OfferTab = 'active' | 'history' | 'cancel'
type SortKey = 'visit' | 'updated' | 'created'

const CANCEL_STATUSES = new Set(['canceled', 'rejected', 'expired', 'no_show'])

const badgeToneByCategory = {
  neutral: 'border-[#e2e8f0] bg-white text-[#64748b]',
  active: 'border-orange-200 bg-orange-50 text-[#C2410C]',
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

export default function StoreOffersClient({
  initialOffers,
  initialLoadError = false,
}: {
  initialOffers: Offer[]
  initialLoadError?: boolean
}) {
  const router = useRouter()
  const [offers, setOffers] = useState<Offer[]>(initialOffers)
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState(initialLoadError)
  const [tab, setTab] = useState<OfferTab>('active')
  const [searchWord, setSearchWord] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('visit')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [filtersOpen, setFiltersOpen] = useState(false)

  const loadOffers = useCallback(async () => {
    setLoading(true)
    setLoadError(false)

    try {
      const data = await getOffersForStore()
      setOffers(data)
    } catch (error) {
      console.error('failed to load store offers', error)
      setLoadError(true)
    } finally {
      setLoading(false)
    }
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

      const aTime = sortKey === 'created' ? getTime(a.created_at) : sortKey === 'updated' ? getTime(a.updated_at) : getTime(a.date)
      const bTime = sortKey === 'created' ? getTime(b.created_at) : sortKey === 'updated' ? getTime(b.updated_at) : getTime(b.date)

      return sortOrder === 'asc' ? aTime - bTime : bTime - aTime
    })

    return rows
  }, [dateFrom, dateTo, offersWithProgress, searchWord, sortKey, sortOrder, statusFilter, tab])

  const hasActiveFilters =
    searchWord.trim().length > 0 ||
    statusFilter !== 'all' ||
    Boolean(dateFrom) ||
    Boolean(dateTo)

  const activeFilterCount =
    (searchWord.trim() ? 1 : 0) +
    (statusFilter !== 'all' ? 1 : 0) +
    (dateFrom ? 1 : 0) +
    (dateTo ? 1 : 0)

  const resetFilters = () => {
    setSearchWord('')
    setStatusFilter('all')
    setDateFrom('')
    setDateTo('')
  }

  const handleRowClick = (offerId: string) => {
    router.push(`/store/offers/${offerId}`)
  }

  return (
    <main className={`${styles.page} text-[#334155]`}>
      <div className={`${styles.pageInner} mx-auto w-full max-w-[1500px]`}>
        <header className="lg:flex lg:items-end lg:justify-between lg:gap-6 lg:rounded-2xl lg:border lg:border-slate-200 lg:bg-white lg:px-5 lg:py-4 lg:shadow-[0_8px_24px_rgba(15,23,42,.04)]">
          <div>
            <h1 className="text-2xl font-bold lg:text-[28px] lg:font-black lg:tracking-tight lg:text-slate-950">オファー管理</h1>
            <p className="mt-1 text-sm text-[#64748b]">来店予定・進捗状況を一覧で確認できます。</p>
          </div>
          <p className="mt-2 hidden shrink-0 text-xs font-medium text-slate-400 lg:block">行をクリックすると詳細を確認できます</p>
        </header>

        <section className="space-y-3 rounded-2xl border border-[#e2e8f0] bg-white p-3 lg:p-4 shadow-[0_8px_24px_rgba(15,23,42,.05)]">
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
                    ? 'border-[#FF5A1F] text-[#C2410C]'
                    : 'border-transparent text-[#64748b] hover:text-[#334155]'
                }`}
              >
                {item.label}
                <span className="ml-1 text-xs">{item.count}</span>
              </button>
            ))}
          </div>

          <div className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc]">
            <div className="flex items-center justify-between gap-3 px-3 py-2.5">
              <button
                type="button"
                onClick={() => setFiltersOpen(open => !open)}
                className="inline-flex min-h-9 items-center gap-2 text-sm font-semibold text-[#334155]"
                aria-expanded={filtersOpen}
              >
                <SlidersHorizontal className="h-4 w-4 text-[#64748b]" />
                絞り込み・並び替え
                {activeFilterCount > 0 && (
                  <span className="rounded-full bg-[#FF5A1F] px-2 py-0.5 text-[10px] font-bold text-white">
                    {activeFilterCount}
                  </span>
                )}
                <ChevronDown className={`h-4 w-4 text-[#94a3b8] transition-transform ${filtersOpen ? 'rotate-180' : ''}`} />
              </button>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-xs font-semibold text-[#64748b] hover:text-[#C2410C]"
                >
                  リセット
                </button>
              )}
            </div>

            {filtersOpen && (
              <div className="grid gap-3 border-t border-[#e2e8f0] p-3 sm:grid-cols-2 lg:grid-cols-6">
                <label className="flex min-w-0 flex-col gap-1 text-xs text-[#64748b] sm:col-span-2">
                  演者名検索
                  <input
                    value={searchWord}
                    onChange={event => setSearchWord(event.target.value)}
                    className="h-10 rounded-xl border border-[#e2e8f0] bg-white px-3 text-sm text-[#334155] outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
                    placeholder="演者名で検索"
                  />
                </label>

                <label className="flex min-w-0 flex-col gap-1 text-xs text-[#64748b]">
                  ステータス
                  <select
                    value={statusFilter}
                    onChange={event => setStatusFilter(event.target.value)}
                    className="h-10 rounded-xl border border-[#e2e8f0] bg-white px-2 text-sm text-[#334155] outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
                  >
                    <option value="all">すべて</option>
                    {Object.entries(statusLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </label>

                <label className="flex min-w-0 flex-col gap-1 text-xs text-[#64748b]">
                  来店日
                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-1.5">
                    <input
                      type="date"
                      aria-label="開始日"
                      value={dateFrom}
                      onChange={event => setDateFrom(event.target.value)}
                      className="h-10 min-w-0 rounded-xl border border-[#e2e8f0] bg-white px-2 text-xs text-[#334155]"
                    />
                    <span className="text-[#94a3b8]">〜</span>
                    <input
                      type="date"
                      aria-label="終了日"
                      value={dateTo}
                      onChange={event => setDateTo(event.target.value)}
                      className="h-10 min-w-0 rounded-xl border border-[#e2e8f0] bg-white px-2 text-xs text-[#334155]"
                    />
                  </div>
                </label>

                <label className="flex min-w-0 flex-col gap-1 text-xs text-[#64748b]">
                  並び替え
                  <select
                    value={sortKey}
                    onChange={event => setSortKey(event.target.value as SortKey)}
                    className="h-10 rounded-xl border border-[#e2e8f0] bg-white px-2 text-sm text-[#334155]"
                  >
                    <option value="visit">来店日</option>
                    <option value="updated">更新日</option>
                    <option value="created">作成日</option>
                  </select>
                </label>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))}
                    className="inline-flex h-10 w-full items-center justify-center gap-1 rounded-xl border border-[#e2e8f0] bg-white px-3 text-sm font-medium text-[#334155] hover:bg-[#f1f5f9]"
                  >
                    <ArrowUpDown className="h-4 w-4" />
                    {sortOrder === 'asc' ? '昇順' : '降順'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {loading ? (
            <TableSkeleton rows={4} />
          ) : loadError ? (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-center"
            >
              <AlertCircle className="mx-auto h-6 w-6 text-red-600" aria-hidden="true" />
              <h2 className="mt-2 text-sm font-semibold text-red-900">
                オファーを読み込めませんでした
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-red-700">
                通信状況を確認して、もう一度お試しください。
              </p>
              <button
                type="button"
                onClick={() => void loadOffers()}
                className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-md border border-red-200 bg-white px-4 text-sm font-semibold text-red-800 transition hover:bg-red-100"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                再読み込み
              </button>
            </div>
          ) : processed.length === 0 ? (
            hasActiveFilters ? (
              <div className="text-center space-y-4 py-10">
                <div>
                  <h3 className="text-lg font-semibold">条件に一致するオファーがありません</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    検索条件を変えるか、条件をリセットしてください。
                  </p>
                </div>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex min-h-10 items-center gap-2 rounded-md border border-[#e2e8f0] bg-white px-4 text-sm font-semibold text-[#334155] transition hover:bg-[#f8fafc]"
                >
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  条件をリセット
                </button>
              </div>
            ) : offersWithProgress.length === 0 ? (
              <EmptyState
                title="まだオファーがありません"
                description="演者へオファーを送ると、ここで進捗を確認できます。"
              />
            ) : (
              <EmptyState title="このタブに表示するオファーはありません" />
            )
          ) : (
            <>
              <section className="hidden overflow-x-auto rounded-xl border border-[#e2e8f0] md:block">
                <Table>
                  <TableHeader className="bg-white lg:bg-slate-50">
                    <TableRow className="h-11 border-b border-[#e2e8f0]">
                      <TableHead className="w-[160px] px-4 text-xs font-semibold text-[#334155]">来店日</TableHead>
                      <TableHead className="min-w-[180px] px-4 text-xs font-semibold text-[#334155]">演者名</TableHead>
                      <TableHead className="w-[130px] px-4 text-xs font-semibold text-[#334155]">現在ステータス</TableHead>
                      <TableHead className="min-w-[260px] px-4 text-xs font-semibold text-[#334155]">進捗</TableHead>
                      <TableHead className="w-[140px] px-4 text-xs font-semibold text-[#334155]">最終更新</TableHead>
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
                            <Badge variant="outline" className={`rounded-md px-2 py-0.5 text-[11px] ${badgeToneByCategory.danger}`}>{statusLabels[o.status ?? 'pending'] ?? '終了'}</Badge>
                          ) : (
                            <div className="space-y-1">
                              <p className="text-xs font-semibold text-[#334155]">{o.badge.label}</p>
                              <div className="flex gap-1.5">
                                {o.steps.map(step => (
                                  <span key={step.key} className={`h-1.5 flex-1 rounded-full ${step.status === 'complete' ? 'bg-[#1f6b4f]' : step.status === 'current' ? 'bg-[#FF8A00]' : 'bg-[#e2e8f0]'}`} />
                                ))}
                              </div>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="px-4 text-xs text-[#64748b]">{formatDate(o.updated_at, 'yyyy/MM/dd HH:mm')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </section>

              <section className="space-y-3 md:hidden">
                {processed.map(o => (
                  <article
                    key={o.id}
                    className="cursor-pointer rounded-2xl border border-[#e2e8f0] bg-white p-3.5 shadow-[0_8px_20px_rgba(15,23,42,.05)] active:bg-orange-50/40"
                    onClick={() => handleRowClick(o.id)}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">{formatDate(o.date)}</p>
                      <Badge variant="outline" className={`rounded-md px-2 py-0.5 text-[11px] ${o.isCanceled ? badgeToneByCategory.danger : o.isHistory ? badgeToneByCategory.success : badgeToneByCategory.active}`}>
                        {statusLabels[o.status ?? 'pending'] ?? '保留中'}
                      </Badge>
                    </div>
                    <p className="mt-2 text-base font-semibold">{o.talent_name ?? '-'}</p>
                    <p className="mt-2 text-xs font-semibold">{o.isCanceled ? (statusLabels[o.status ?? 'pending'] ?? '終了') : o.badge.label}</p>
                    {!o.isCanceled && (
                      <div className="mt-1 flex gap-1.5">
                        {o.steps.map(step => (
                          <span key={step.key} className={`h-1.5 flex-1 rounded-full ${step.status === 'complete' ? 'bg-[#1f6b4f]' : step.status === 'current' ? 'bg-[#FF8A00]' : 'bg-[#e2e8f0]'}`} />
                        ))}
                      </div>
                    )}
                    <div className="mt-3 flex items-center justify-between text-xs text-[#64748b]">
                      <span>最終更新: {formatDate(o.updated_at, 'yyyy/MM/dd HH:mm')}</span>
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
