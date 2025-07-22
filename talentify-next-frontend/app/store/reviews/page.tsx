'use client'
import { useEffect, useState } from 'react'
import { getVisitedOffersForStore, VisitedOffer } from '@/utils/getVisitedOffersForStore'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import ReviewModal from '@/components/modals/ReviewModal'

export default function StoreReviewsPage() {
  const [offers, setOffers] = useState<VisitedOffer[]>([])
  const [loading, setLoading] = useState(true)
  const [storeId, setStoreId] = useState('')

  useEffect(() => {
    const load = async () => {
      const data = await getVisitedOffersForStore()
      setOffers(data)
      setLoading(false)
      if (data[0]) setStoreId(data[0].user_id)
    }
    load()
  }, [])

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">来店完了オファー一覧</h1>
      {loading ? (
        <p>読み込み中...</p>
      ) : offers.length === 0 ? (
        <p>完了したオファーはありません。</p>
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
                <TableCell>{o.date}</TableCell>
                <TableCell>{o.talent_name || o.talent_id}</TableCell>
                <TableCell>
                  {o.reviewed ? (
                    <span className="text-sm text-gray-500">レビュー済</span>
                  ) : (
                    <ReviewModal
                      offerId={o.id}
                      talentId={o.talent_id}
                      storeId={o.user_id}
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
