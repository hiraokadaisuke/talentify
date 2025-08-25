'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getOffersForTalent, TalentOffer } from '@/utils/getOffersForTalent'
import { fetchStoreNamesForOffers } from '@/utils/storeName'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { TableSkeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { formatJaDateTimeWithWeekday } from '@/utils/formatJaDateTimeWithWeekday'
import { toast } from 'sonner'

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

export default function TalentOffersPage() {
  const [offers, setOffers] = useState<TalentOffer[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortKey, setSortKey] = useState<'created_at' | 'date'>('created_at')
  const [search, setSearch] = useState('')
  const [storeNames, setStoreNames] = useState<Map<string, string>>(new Map())

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getOffersForTalent()
        setOffers(data)
        const ids = data.map(o => o.id)
        const nameMap = await fetchStoreNamesForOffers(ids)
        setStoreNames(nameMap)
      } catch (e) {
        console.error('failed to load offers', e)
        toast.error('オファーの取得に失敗しました')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = offers
    .filter(o => (statusFilter === 'all' ? true : o.status === statusFilter))
    .filter(o => (storeNames.get(o.id) ?? '').toLowerCase().includes(search.toLowerCase()))

  const sorted = [...filtered].sort((a, b) => {
    const aVal = a[sortKey] ? new Date(a[sortKey]!).getTime() : 0
    const bVal = b[sortKey] ? new Date(b[sortKey]!).getTime() : 0
    return bVal - aVal
  })

  return (
    <main className="p-4 md:p-6 space-y-4">
      <h1 className="text-xl font-bold">受信オファー一覧</h1>
      <div className="flex flex-wrap gap-2 text-sm items-center">
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="border rounded p-1"
        >
          <option value="all">すべて</option>
          <option value="pending">保留中</option>
          <option value="confirmed">承諾済</option>
          <option value="rejected">拒否</option>
          <option value="completed">来店完</option>
        </select>
        <select
          value={sortKey}
          onChange={e => setSortKey(e.target.value as 'created_at' | 'date')}
          className="border rounded p-1"
        >
          <option value="created_at">送信日</option>
          <option value="date">来店日</option>
        </select>
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="検索"
          className="w-40"
        />
      </div>

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
                  <TableHead className="w-1/4">店舗名</TableHead>
                  <TableHead className="w-1/6">オファー送信日</TableHead>
                  <TableHead className="w-1/6">来店日</TableHead>
                  <TableHead className="w-1/6">支払い状況</TableHead>
                  <TableHead className="w-1/6">状態</TableHead>
                  <TableHead className="w-1/12">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map(o => (
                  <TableRow key={o.id} className="h-10">
                    <TableCell className="truncate" title={storeNames.get(o.id) ?? ''}>{
                      storeNames.get(o.id) ?? '-'
                    }</TableCell>
                    <TableCell>{formatJaDateTimeWithWeekday(o.created_at ?? '')}</TableCell>
                    <TableCell>{o.date ? formatJaDateTimeWithWeekday(o.date) : '未定'}</TableCell>
                    <TableCell>{o.paid ? '済' : '未'}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariants[o.status ?? 'pending']}>
                        {statusLabels[o.status ?? 'pending']}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Link href={`/talent/offers/${o.id}`} className="text-blue-600 underline">
                        詳細
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="md:hidden space-y-2">
            {sorted.map(o => (
              <div key={o.id} className="border rounded p-2 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-medium truncate" title={storeNames.get(o.id) ?? ''}>{
                    storeNames.get(o.id) ?? '-'
                  }</span>
                  <Badge variant={statusVariants[o.status ?? 'pending']}>
                    {statusLabels[o.status ?? 'pending']}
                  </Badge>
                </div>
                <div className="text-sm space-y-0.5">
                  <div>オファー送信日: {formatJaDateTimeWithWeekday(o.created_at ?? '')}</div>
                  <div>来店日: {o.date ? formatJaDateTimeWithWeekday(o.date) : '未定'}</div>
                  <div>支払い状況: {o.paid ? '済' : '未'}</div>
                </div>
                <div className="flex justify-end">
                  <Link href={`/talent/offers/${o.id}`} className="text-blue-600 underline text-sm">
                    詳細
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  )
}
