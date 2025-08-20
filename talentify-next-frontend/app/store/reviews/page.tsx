'use client'
import { useEffect, useState } from 'react'
import { getCompletedOffersForStore, CompletedOffer } from '@/utils/getCompletedOffersForStore'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import ReviewModal from '@/components/modals/ReviewModal'

export default function StoreReviewsPage() {
  const [offers, setOffers] = useState<CompletedOffer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const data = await getCompletedOffersForStore()
      setOffers(data)
      setLoading(false)
    }
    load()
  }, [])

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">レビュー投稿済みオファー一覧</h1>
      {loading ? (
        <p>読み込み中...</p>
      ) : offers.length === 0 ? (
        <p>該当するオファーはありません。</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>日付</TableHead>
              <TableHead>演者</TableHead>
              <TableHead>レビュー</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {offers.map(o => (
              <TableRow key={o.id}>
                <TableCell>
                  {new Date(o.date).toLocaleDateString('ja-JP', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                  })}
                </TableCell>
                <TableCell>{o.talent_name || o.talent_id}</TableCell>
                <TableCell>
                  {o.reviewed ? (
                    <span className="text-sm text-gray-500">レビュー済</span>
                  ) : (
                    <ReviewModal
                      offerId={o.id}
                      talentId={o.talent_id}
                      trigger={<Button size="sm">レビューする</Button>}
                      onSubmitted={() => {
                        setOffers(prev => prev.map(p => p.id === o.id ? { ...p, reviewed: true } : p))
                      }}
                    />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </main>
  )
}
