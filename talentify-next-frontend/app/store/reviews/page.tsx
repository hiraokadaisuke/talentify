'use client'

import { useEffect, useState } from 'react'
import { getCompletedOffersForStore, CompletedOffer } from '@/utils/getCompletedOffersForStore'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import ReviewModal from '@/components/modals/ReviewModal'
import {
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from '@/components/ui/modal'
import { createClient } from '@/utils/supabase/client'

type ReviewDetail = {
  offer_id: string
  rating: number
  comment: string | null
}

const supabase = createClient()

function renderStars(rating: number) {
  return `${'★'.repeat(rating)}${'☆'.repeat(Math.max(5 - rating, 0))}`
}

export default function StoreReviewsPage() {
  const [offers, setOffers] = useState<CompletedOffer[]>([])
  const [loading, setLoading] = useState(true)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedOffer, setSelectedOffer] = useState<CompletedOffer | null>(null)
  const [selectedReview, setSelectedReview] = useState<ReviewDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      const data = await getCompletedOffersForStore()
      setOffers(data)
      setLoading(false)
    }
    load()
  }, [])

  const openDetail = async (offer: CompletedOffer) => {
    setSelectedOffer(offer)
    setSelectedReview(null)
    setDetailOpen(true)
    setDetailLoading(true)

    const { data, error } = await supabase
      .from('reviews')
      .select('offer_id, rating, comment')
      .eq('offer_id', offer.id)
      .order('created_at', { ascending: false })
      .maybeSingle()

    if (error) {
      console.error('failed to fetch review detail', error)
    }

    setSelectedReview(data as ReviewDetail | null)
    setDetailLoading(false)
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold">レビュー投稿一覧</h1>
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
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
                  <TableHead>詳細</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {offers.map(o => (
                  <TableRow key={o.id} className="hover:bg-gray-50">
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
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={!o.reviewed}
                        onClick={() => openDetail(o)}
                      >
                        詳細
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </section>
      </div>

      <Modal open={detailOpen} onOpenChange={setDetailOpen}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>レビュー詳細</ModalTitle>
          </ModalHeader>
          {detailLoading ? (
            <p className="text-sm text-gray-500">読み込み中...</p>
          ) : !selectedOffer || !selectedReview ? (
            <p className="text-sm text-gray-500">レビューが見つかりませんでした。</p>
          ) : (
            <div className="space-y-3 text-sm">
              <p>
                <span className="font-medium">日付：</span>
                {new Date(selectedOffer.date).toLocaleDateString('ja-JP', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                })}
              </p>
              <p>
                <span className="font-medium">評価：</span>
                <span className="tracking-wide text-amber-500">{renderStars(selectedReview.rating)}</span>
              </p>
              <p>
                <span className="font-medium">コメント：</span>
                {selectedReview.comment || 'コメントはありません'}
              </p>
            </div>
          )}
          <ModalFooter>
            <Button variant="outline" onClick={() => setDetailOpen(false)}>
              閉じる
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </main>
  )
}
