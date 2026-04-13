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

type ReviewSummary = {
  offer_id: string
  rating: number
}

const supabase = createClient()

function renderStars(rating: number) {
  return `${'★'.repeat(rating)}${'☆'.repeat(Math.max(5 - rating, 0))}`
}

export default function StoreReviewsPage() {
  const [offers, setOffers] = useState<CompletedOffer[]>([])
  const [reviewByOfferId, setReviewByOfferId] = useState<Record<string, ReviewSummary>>({})
  const [loading, setLoading] = useState(true)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedOffer, setSelectedOffer] = useState<CompletedOffer | null>(null)
  const [selectedReview, setSelectedReview] = useState<ReviewDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      const data = await getCompletedOffersForStore()
      setOffers(data)
      if (data.length > 0) {
        const offerIds = data.map((offer) => offer.id)
        const { data: reviewData, error } = await supabase
          .from('reviews')
          .select('offer_id, rating')
          .in('offer_id', offerIds)
        if (error) {
          console.error('failed to fetch review summary', error)
        } else {
          const summaryMap = (reviewData ?? []).reduce<Record<string, ReviewSummary>>((acc, item) => {
            if (!acc[item.offer_id]) {
              acc[item.offer_id] = item as ReviewSummary
            }
            return acc
          }, {})
          setReviewByOfferId(summaryMap)
        }
      }
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
    <main className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="mx-auto w-full max-w-5xl">
        <h1 className="mb-6 text-3xl font-bold tracking-tight">レビュー投稿一覧</h1>
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
                  <TableHead>評価</TableHead>
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
                      {reviewByOfferId[o.id] ? (
                        <span className="tracking-wide text-amber-500">
                          {renderStars(reviewByOfferId[o.id].rating)}
                        </span>
                      ) : (
                        <ReviewModal
                          offerId={o.id}
                          talentId={o.talent_id}
                          trigger={<Button size="sm">レビューする</Button>}
                          onSubmitted={async () => {
                            setOffers(prev => prev.map(p => p.id === o.id ? { ...p, reviewed: true } : p))
                            const { data: latestReview } = await supabase
                              .from('reviews')
                              .select('offer_id, rating')
                              .eq('offer_id', o.id)
                              .order('created_at', { ascending: false })
                              .maybeSingle()
                            if (latestReview) {
                              setReviewByOfferId((prev) => ({
                                ...prev,
                                [o.id]: latestReview as ReviewSummary,
                              }))
                            }
                          }}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={!reviewByOfferId[o.id]}
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
