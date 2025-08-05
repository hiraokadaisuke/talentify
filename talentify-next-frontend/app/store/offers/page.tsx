'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getOffersForStore, Offer } from '@/utils/getOffersForStore'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { TableSkeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import {
  Modal,
  ModalTrigger,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalFooter,
  ModalClose,
} from '@/components/ui/modal'

const statusLabels: Record<string, string> = {
  pending: '保留中',
  confirmed: '承諾済み',
  rejected: '拒否',
  expired: '期限切れ',
}

export default function StoreOffersPage() {
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [sortKey, setSortKey] = useState<'created_at'>('created_at')
  const [selected, setSelected] = useState<Offer | null>(null)

  useEffect(() => {
    const load = async () => {
      const data = await getOffersForStore()
      setOffers(data)
      setLoading(false)
    }
    load()
  }, [])

  const filtered = offers.filter(o => (filter === 'all' ? true : o.status === filter))
  const sorted = [...filtered].sort((a, b) => {
    const aa = a[sortKey] || ''
    const bb = b[sortKey] || ''
    return aa < bb ? -1 : aa > bb ? 1 : 0
  })

  const groups: Record<string, Offer[]> = {
    pending: [],
    confirmed: [],
    rejected: [],
    expired: [],
  }
  for (const o of sorted) {
    const key = o.status || 'pending'
    if (groups[key]) groups[key].push(o)
  }

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">オファー一覧</h1>

      <div className="flex gap-4 items-center text-sm">
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="border rounded p-1"
        >
          <option value="all">すべて</option>
          <option value="pending">保留中</option>
          <option value="confirmed">承諾済み</option>
          <option value="rejected">拒否</option>
          <option value="expired">期限切れ</option>
        </select>
        <select
          value={sortKey}
          onChange={e => setSortKey(e.target.value as 'created_at')}
          className="border rounded p-1"
        >
          <option value="created_at">作成順</option>
        </select>
      </div>

      {loading ? (
        <TableSkeleton rows={3} />
      ) : offers.length === 0 ? (
        <EmptyState title='まだオファーがありません' actionHref='/talent-search' actionLabel='オファーを送ってみましょう' />
      ) : (
        (['pending', 'confirmed', 'rejected', 'expired'] as const).map(status => (
          groups[status].length > 0 && (
            <div key={status} className="space-y-2">
              <h2 className="font-semibold">{statusLabels[status]}</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>作成日</TableHead>
                    <TableHead>メッセージ</TableHead>
                    <TableHead>支払い状況</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groups[status].map(o => (
                    <TableRow key={o.id}>
                      <TableCell>{o.created_at?.slice(0, 10)}</TableCell>
                      <TableCell className="truncate max-w-xs">{o.message}</TableCell>
                      <TableCell>{o.paid ? '済' : '未'}</TableCell>
                      <TableCell>
                        <Modal onOpenChange={open => !open && setSelected(null)}>
                          <ModalTrigger asChild>
                            <Button size='sm' onClick={() => setSelected(o)}>
                              詳細を見る
                            </Button>
                          </ModalTrigger>
                          <ModalContent>
                            <ModalHeader>
                              <ModalTitle>オファー詳細</ModalTitle>
                            </ModalHeader>
                            <p className='text-sm whitespace-pre-line mb-4'>{selected?.message}</p>
                            <ModalFooter>
                              <Button asChild variant='outline'>
                                <Link href={`/store/offers/${selected?.id}`}>詳細ページへ</Link>
                              </Button>
                              <ModalClose asChild>
                                <Button variant='secondary'>閉じる</Button>
                              </ModalClose>
                            </ModalFooter>
                          </ModalContent>
                        </Modal>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )
        ))
      )}
    </main>
  )
}
