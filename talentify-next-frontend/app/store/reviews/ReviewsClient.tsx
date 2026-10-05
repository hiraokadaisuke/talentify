'use client'

import { useCallback, useMemo, useState } from 'react'
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
import { AlertCircle, CalendarDays, CheckCircle2, RotateCcw, Star } from 'lucide-react'
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

type ReviewTab = 'pending' | 'done' | 'all'

const supabase = createClient()

function renderStars(rating: number) {
  return `${'★'.repeat(rating)}${'☆'.repeat(Math.max(5 - rating, 0))}`
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

export default function StoreReviewsClient({
  initialOffers,
  initialReviewByOfferId,
  initialLoadError = false,
}: {
  initialOffers: CompletedOffer[]
  initialReviewByOfferId: Record<string, ReviewSummary>
  initialLoadError?: boolean
}) {
  const [offers, setOffers] = useState<CompletedOffer[]>(initialOffers)
  const [reviewByOfferId, setReviewByOfferId] = useState<Record<string, ReviewSummary>>(initialReviewByOfferId)
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState(initialLoadError)
  const [tab, setTab] = useState<ReviewTab>('pending')
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedOffer, setSelectedOffer] = useState<CompletedOffer | null>(null)
  const [selectedReview, setSelectedReview] = useState<ReviewDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState(false)

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

      if (error) throw error

      const summaryMap = (reviewData ?? []).reduce<Record<string, ReviewSummary>>((acc, item) => {
        if (!acc[item.offer_id]) acc[item.offer_id] = item as ReviewSummary
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

  const pendingCount = useMemo(
    () => offers.filter((offer) => !reviewByOfferId[offer.id]).length,
    [offers, reviewByOfferId],
  )
  const doneCount = offers.length - pendingCount

  const visibleOffers = useMemo(() => {
    if (tab === 'pending') return offers.filter((offer) => !reviewByOfferId[offer.id])
    if (tab === 'done') return offers.filter((offer) => Boolean(reviewByOfferId[offer.id]))
    return offers
  }, [offers, reviewByOfferId, tab])

  const openDetail = async (offer: CompletedOffer) => {
    setSelectedOffer(offer)
    setSelectedReview(null)
    setDetailError(false)
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
      setDetailError(true)
      setDetailLoading(false)
      return
    }

    setSelectedReview(data as ReviewDetail | null)
    setDetailLoading(false)
  }

  const handleSubmitted = async (offerId: string) => {
    setOffers((prev) => prev.map((item) => item.id === offerId ? { ...item, reviewed: true } : item))
    const { data: latestReview } = await supabase
      .from('reviews')
      .select('offer_id, rating')
      .eq('offer_id', offerId)
      .order('created_at', { ascending: false })
      .maybeSingle()

    if (latestReview) {
      setReviewByOfferId((prev) => ({ ...prev, [offerId]: latestReview as ReviewSummary }))
    }
  }

  return (
    <main className="text-[#334155]">
      <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-4 lg:gap-5">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,.05)]">
          <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5 lg:p-6">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#0B1F3B] text-[#FFC400]">
                <Star className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[11px] font-black tracking-[0.16em] text-[#C2410C]">STORE REVIEWS</p>
                <h1 className="mt-0.5 text-xl font-black tracking-tight text-slate-950 sm:text-2xl">レビュー管理</h1>
                <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
                  来店と支払いが完了した案件のレビューを投稿・確認できます。
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="rounded-xl bg-orange-50 px-3 py-2 text-center">
                <p className="text-[10px] font-bold text-[#C2410C]">未投稿</p>
                <p className="mt-0.5 text-lg font-black text-slate-950">{pendingCount}<span className="ml-0.5 text-[10px]">件</span></p>
              </div>
              <div className="rounded-xl bg-slate-50 px-3 py-2 text-center">
                <p className="text-[10px] font-bold text-slate-500">投稿済み</p>
                <p className="mt-0.5 text-lg font-black text-slate-950">{doneCount}<span className="ml-0.5 text-[10px]">件</span></p>
              </div>
            </div>
          </div>
          <div className="h-1 bg-gradient-to-r from-[#FF3B2E] via-[#FF8A00] to-[#FFC400]" />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_8px_24px_rgba(15,23,42,.05)] sm:p-4">
          <div className="flex gap-1 border-b border-slate-200 pb-2">
            {([
              ['pending', '未投稿', pendingCount],
              ['done', '投稿済み', doneCount],
              ['all', 'すべて', offers.length],
            ] as const).map(([key, label, count]) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={`min-h-10 rounded-lg px-3 text-sm font-bold transition ${
                  tab === key
                    ? 'bg-orange-50 text-[#C2410C]'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                {label}<span className="ml-1 text-xs">{count}</span>
              </button>
            ))}
          </div>

          <div className="pt-3">
            {loading ? (
              <TableSkeleton rows={4} />
            ) : loadError ? (
              <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-center">
                <AlertCircle className="mx-auto h-6 w-6 text-red-600" aria-hidden="true" />
                <h2 className="mt-2 text-sm font-semibold text-red-900">レビュー対象を読み込めませんでした</h2>
                <p className="mt-1 text-xs leading-relaxed text-red-700">通信状況を確認して、もう一度お試しください。</p>
                <button
                  type="button"
                  onClick={() => void loadReviews()}
                  className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-xl border border-red-200 bg-white px-4 text-sm font-semibold text-red-800 transition hover:bg-red-100"
                >
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  再読み込み
                </button>
              </div>
            ) : offers.length === 0 ? (
              <EmptyState
                illustration={
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-orange-50 text-[#C2410C]">
                    <Star className="h-6 w-6" />
                  </span>
                }
                title="レビューできる案件はまだありません"
                description="来店と支払いが完了した案件ができると、ここからレビューを投稿できます。"
                className="border-0 px-4 py-8 shadow-none"
              />
            ) : visibleOffers.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500" />
                <h2 className="mt-3 text-sm font-black text-slate-800">
                  {tab === 'pending' ? '未投稿のレビューはありません' : '投稿済みのレビューはありません'}
                </h2>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {tab === 'pending' ? '現在、対応が必要なレビューはありません。' : 'レビューを投稿すると、ここで確認できます。'}
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-3 md:hidden">
                  {visibleOffers.map((offer) => {
                    const review = reviewByOfferId[offer.id]
                    return (
                      <article key={offer.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_6px_18px_rgba(15,23,42,.04)]">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                              <CalendarDays className="h-3.5 w-3.5" />
                              {formatDate(offer.date)}
                            </p>
                            <p className="mt-1.5 break-words text-base font-black text-slate-950">
                              {offer.talent_name || '演者名未設定'}
                            </p>
                          </div>
                          {review ? (
                            <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-700">
                              投稿済み
                            </span>
                          ) : (
                            <span className="shrink-0 rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-black text-[#C2410C]">
                              未投稿
                            </span>
                          )}
                        </div>

                        {review ? (
                          <>
                            <p className="mt-3 tracking-wide text-amber-500">{renderStars(review.rating)}</p>
                            <Button
                              size="sm"
                              variant="outline"
                              className="mt-3 min-h-10 w-full rounded-xl border-slate-200 font-bold"
                              onClick={() => void openDetail(offer)}
                            >
                              投稿したレビューを見る
                            </Button>
                          </>
                        ) : (
                          <ReviewModal
                            offerId={offer.id}
                            talentId={offer.talent_id}
                            trigger={
                              <Button size="sm" className="mt-3 min-h-10 w-full rounded-xl bg-[#FF5A1F] font-bold text-white hover:bg-[#E94F18]">
                                レビューを投稿
                              </Button>
                            }
                            onSubmitted={() => void handleSubmitted(offer.id)}
                          />
                        )}
                      </article>
                    )
                  })}
                </div>

                <div className="hidden overflow-x-auto rounded-xl border border-slate-200 md:block">
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow>
                        <TableHead className="w-[160px]">来店日</TableHead>
                        <TableHead>演者</TableHead>
                        <TableHead className="w-[170px]">レビュー</TableHead>
                        <TableHead className="w-[160px]">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {visibleOffers.map((offer) => {
                        const review = reviewByOfferId[offer.id]
                        return (
                          <TableRow key={offer.id}>
                            <TableCell>{formatDate(offer.date)}</TableCell>
                            <TableCell className="font-semibold text-slate-800">{offer.talent_name || '演者名未設定'}</TableCell>
                            <TableCell>
                              {review ? (
                                <span className="tracking-wide text-amber-500">{renderStars(review.rating)}</span>
                              ) : (
                                <span className="text-xs font-bold text-slate-400">未投稿</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {review ? (
                                <Button size="sm" variant="outline" className="rounded-lg" onClick={() => void openDetail(offer)}>
                                  詳細を見る
                                </Button>
                              ) : (
                                <ReviewModal
                                  offerId={offer.id}
                                  talentId={offer.talent_id}
                                  trigger={<Button size="sm" className="rounded-lg bg-[#FF5A1F] text-white hover:bg-[#E94F18]">レビューを投稿</Button>}
                                  onSubmitted={() => void handleSubmitted(offer.id)}
                                />
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </div>
        </section>
      </div>

      <Modal open={detailOpen} onOpenChange={setDetailOpen}>
        <ModalContent className="w-[calc(100vw-1.5rem)] max-w-lg sm:w-full">
          <ModalHeader>
            <ModalTitle>投稿したレビュー</ModalTitle>
          </ModalHeader>
          {detailLoading ? (
            <p className="text-sm text-slate-500">読み込み中...</p>
          ) : detailError ? (
            <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-center">
              <AlertCircle className="mx-auto h-5 w-5 text-red-600" aria-hidden="true" />
              <p className="mt-2 text-sm font-semibold text-red-900">レビュー詳細を読み込めませんでした</p>
              {selectedOffer && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-3 min-h-9"
                  onClick={() => void openDetail(selectedOffer)}
                >
                  <RotateCcw className="mr-1.5 h-4 w-4" aria-hidden="true" />
                  再読み込み
                </Button>
              )}
            </div>
          ) : !selectedOffer || !selectedReview ? (
            <p className="text-sm text-slate-500">レビューが見つかりませんでした。</p>
          ) : (
            <div className="space-y-4 text-sm">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-bold text-slate-400">来店日</p>
                <p className="mt-1 font-bold text-slate-800">{formatDate(selectedOffer.date)}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400">評価</p>
                <p className="mt-1 text-lg tracking-wide text-amber-500">{renderStars(selectedReview.rating)}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400">コメント</p>
                <p className="mt-1 whitespace-pre-wrap leading-6 text-slate-700">
                  {selectedReview.comment || 'コメントはありません'}
                </p>
              </div>
            </div>
          )}
          <ModalFooter>
            <Button variant="outline" onClick={() => setDetailOpen(false)}>閉じる</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </main>
  )
}
