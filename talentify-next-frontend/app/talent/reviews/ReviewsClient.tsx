'use client'

import { useCallback, useMemo, useState } from 'react'
import { AlertCircle, MessageSquareText, RotateCcw, Star } from 'lucide-react'
import { getReviewsForTalent, TalentReview } from '@/utils/getReviewsForTalent'
import { EmptyState } from '@/components/ui/empty-state'
import { TableSkeleton } from '@/components/ui/skeleton'

const categoryLabels: Record<string, string> = {
  time: '時間厳守',
  attitude: '接客態度',
  fan: 'ファンサービス',
  play: '遊技姿勢',
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

function RatingStars({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-amber-500">
      {[...Array(5)].map((_, index) => (
        <Star key={index} size={size} fill={index < rating ? 'currentColor' : 'none'} />
      ))}
    </span>
  )
}

export default function TalentReviewsClient({
  initialReviews,
  initialLoadError = false,
}: {
  initialReviews: TalentReview[]
  initialLoadError?: boolean
}) {
  const [reviews, setReviews] = useState<TalentReview[]>(initialReviews)
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState(initialLoadError)

  const loadReviews = useCallback(async () => {
    setLoading(true)
    setLoadError(false)

    try {
      const data = await getReviewsForTalent()
      setReviews(data)
    } catch (error) {
      console.error('failed to load talent reviews', error)
      setLoadError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return null
    return reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
  }, [reviews])

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
                <p className="text-[11px] font-black tracking-[0.16em] text-[#C2410C]">TALENT REVIEWS</p>
                <h1 className="mt-0.5 text-xl font-black tracking-tight text-slate-950 sm:text-2xl">レビュー管理</h1>
                <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">店舗から届いたレビューを確認できます。</p>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="rounded-xl bg-slate-50 px-3 py-2 text-center">
                <p className="text-[10px] font-bold text-slate-500">レビュー</p>
                <p className="mt-0.5 text-lg font-black text-slate-950">{reviews.length}<span className="ml-0.5 text-[10px]">件</span></p>
              </div>
              <div className="rounded-xl bg-orange-50 px-3 py-2 text-center">
                <p className="text-[10px] font-bold text-[#C2410C]">平均評価</p>
                <p className="mt-0.5 text-lg font-black text-slate-950">{averageRating ? averageRating.toFixed(1) : '-'}</p>
              </div>
            </div>
          </div>
          <div className="h-1 bg-gradient-to-r from-[#FF3B2E] via-[#FF8A00] to-[#FFC400]" />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_8px_24px_rgba(15,23,42,.05)] sm:p-4">
          {loading ? (
            <TableSkeleton rows={3} />
          ) : loadError ? (
            <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-center">
              <AlertCircle className="mx-auto h-6 w-6 text-red-600" aria-hidden="true" />
              <h2 className="mt-2 text-sm font-semibold text-red-900">レビューを読み込めませんでした</h2>
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
          ) : reviews.length === 0 ? (
            <EmptyState
              illustration={
                <span className="grid h-12 w-12 place-items-center rounded-full bg-orange-50 text-[#C2410C]">
                  <MessageSquareText className="h-6 w-6" />
                </span>
              }
              title="まだレビューはありません"
              description="店舗からレビューが投稿されると、ここに表示されます。"
              className="border-0 px-4 py-8 shadow-none"
            />
          ) : (
            <div className="grid gap-3 lg:grid-cols-2">
              {reviews.map((review) => (
                <article
                  key={review.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_6px_18px_rgba(15,23,42,.04)]"
                >
                  <div className="flex items-start justify-between gap-3 p-4 sm:p-5">
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-slate-400">{formatDate(review.created_at)}</p>
                      <h2 className="mt-1 break-words text-base font-black text-slate-950 sm:text-lg">
                        {review.store.name ?? '店舗名未設定'}
                      </h2>
                    </div>
                    <div className="shrink-0 text-right">
                      <RatingStars rating={review.rating} />
                      <p className="mt-1 text-xs font-black text-slate-600">{review.rating} / 5</p>
                    </div>
                  </div>

                  {review.category_ratings && Object.keys(review.category_ratings).length > 0 && (
                    <div className="grid gap-x-5 gap-y-2 border-t border-slate-100 bg-slate-50/70 px-4 py-3 sm:grid-cols-2 sm:px-5">
                      {Object.entries(review.category_ratings).map(([key, value]) => (
                        <div key={key} className="flex min-w-0 items-center justify-between gap-2">
                          <span className="text-[11px] font-bold text-slate-500">{categoryLabels[key] ?? key}</span>
                          <RatingStars rating={value as number} size={12} />
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="border-t border-slate-100 px-4 py-4 sm:px-5">
                    <p className="text-[11px] font-bold text-slate-400">コメント</p>
                    <p className="mt-1.5 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
                      {review.comment || 'コメントはありません'}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
