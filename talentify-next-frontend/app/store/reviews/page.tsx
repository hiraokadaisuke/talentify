'use client'

import { useCallback, useEffect, useState } from 'react'
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
import { AlertCircle, RotateCcw } from 'lucide-react'
import { EmptyState } from '@/components/ui/empty-state'
import { TableSkeleton } from '@/components/ui/skeleton'

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
  const [loadError, setLoadError] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedOffer, setSelectedOffer] = useState<CompletedOffer | null>(null)
  const [selectedReview, setSelectedReview] = useState<ReviewDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const loadReviews = useCallback(async () => {
    setLoading(true)
    setLoadError(false)

    try {
      const data = await getCompletedOffersForStore()
      setOffers(data)

      if (data.length === 0) {
        setReviewByOfferId({})
        return
      }

      const offerIds = data.map((offer) => offer.id)
      const { data: reviewData, error } = await supabase
        .from('reviews')
        .select('offer_id, rating')
        .in('offer_id', offerIds)

      if (error) {
        console.error('failed to fetch review summary', error)
        throw error
      }

      const summaryMap = (reviewData ?? []).reduce<Record<string, ReviewSummary>>((acc, item) => {
        if (!acc[item.offer_id]) {
          acc[item.offer_id] = item as ReviewSummary
        }
        return acc
      }, {})

      setReviewByOfferId(summaryMap)
    } catch (error) {
      console.error('failed to load store reviews', error)
      setLoadError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadReviews()
  }, [loadReviews])

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
    <main className="min-h-screen bg-gray-100 px-3 py-5 sm:px-4 sm:py-8">
      <div className="mx-auto w-full max-w-5xl">
        <h1 className="mb-4 text-2xl font-bold tracking-tight sm:mb-6 sm:text-3xl">レビュー投稿一覧</h1>
        <section className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm sm:p-6">
          {loading ? (
            <TableSkeleton rows={4} />
          ) : loadError ? (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-center"
            >
              <AlertCircle className="mx-auto h-6 w-6 text-red-600" aria-hidden="true" />
              <h2 className="mt-2 text-sm font-semibold text-red-900">
                レビュー対象を読み込めませんでした
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-red-700">
                通信状況を確認して、もう一度お試しください。
              </p>
              <button
                type="button"
                onClick={() => void loadReviews()}
                className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-md border border-red-200 bg-white px-4 text-sm font-semibold text-red-800 transition hover:bg-red-100"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                再読み込み
              </button>
            </div>
          ) : offers.length === 0 ? (
            <EmptyState
              title="レビューできる案件はまだありません"
              description="来店と支払いが完了した案件があると、ここからレビューを投稿できます。"
            />
          ) : (
            <>
              <div className="space-y-3 md:hidden">
                {offers.map(o => (
                  <article key={o.id} className="rounded-xl border border-slate-200 bg-white p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs text-slate-500">
                          {new Date(o.date).toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                        </p>
                        <p className="mt-1 break-words font-semibold">{o.talent_name || o.talent_id}</p>
                      </div>
                      {reviewByOfferId[o.id] && (
                        <span className="shrink-0 tracking-wide text-amber-500">{renderStars(reviewByOfferId[o.id].rating)}</span>
                      )}
                    </div>
                    <div className="mt-4">
                      {!reviewByOfferId[o.id] ? (
                        <ReviewModal
                          offerId={o.id}
                          talentId={o.talent_id}
                          trigger={<Button size="sm" className="min-h-10 w-full">レビューする</Button>}
                          onSubmitted={async () => {
                            setOffers(prev => prev.map(p => p.id === o.id ? { ...p, reviewed: true } : p))
                            const { data: latestReview } = await supabase
                              .from('reviews')
                              .select('offer_id, rating')
                              .eq('offer_id', o.id)
                              .order('created_at', { ascending: false })
                              .maybeSingle()
                            if (latestReview) setReviewByOfferId(prev => ({ ...prev, [o.id]: latestReview as ReviewSummary }))
                          }}
                        />
                      ) : (
                        <Button size="sm" variant="outline" className="min-h-10 w-full" onClick={() => openDetail(o)}>詳細を見る</Button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
              <div className="hidden overflow-x-auto md:block">
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
              </div>
            </>
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
