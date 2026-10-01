'use client'

import { useCallback, useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, RotateCcw, Star } from 'lucide-react'
import { getReviewsForTalent, TalentReview } from '@/utils/getReviewsForTalent'
import { EmptyState } from '@/components/ui/empty-state'
import { TableSkeleton } from '@/components/ui/skeleton'

export default function TalentReviewPage() {
  const [reviews, setReviews] = useState<TalentReview[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)

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

  useEffect(() => {
    void loadReviews()
  }, [loadReviews])

  return (
    <main className="mx-auto w-full max-w-screen-md space-y-4 px-4 py-6 sm:space-y-6 sm:px-6 sm:py-8">
      <header>
        <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">評価・レビュー</h1>
        <p className="mt-1 text-sm text-slate-500">店舗から届いた公開レビューを確認できます。</p>
      </header>

      {loading ? (
        <TableSkeleton rows={3} />
      ) : loadError ? (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-center"
        >
          <AlertCircle className="mx-auto h-6 w-6 text-red-600" aria-hidden="true" />
          <h2 className="mt-2 text-sm font-semibold text-red-900">
            レビューを読み込めませんでした
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
      ) : reviews.length === 0 ? (
        <EmptyState
          title="まだレビューがありません"
          description="店舗からレビューが投稿されると、ここに表示されます。"
        />
      ) : (
        reviews.map(review => (
          <Card key={review.id} className="overflow-hidden rounded-2xl border-slate-200 shadow-sm">
            <CardHeader className="space-y-2 p-4 sm:p-5">
              <CardTitle className="break-words text-base leading-6 sm:text-lg">
                {review.store.name ?? '店舗不明'}（
                {new Date(review.created_at).toLocaleDateString('ja-JP', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                })}
                ）
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 border-t border-slate-100 p-4 text-sm sm:p-5">
              <div className="flex flex-wrap items-center gap-1 text-yellow-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill={i < review.rating ? 'currentColor' : 'none'} />
                ))}
                <span className="ml-2 font-semibold text-slate-700">{review.rating} / 5</span>
              </div>
              {review.category_ratings && (
                <div className="grid gap-2 rounded-xl bg-slate-50 p-3 sm:grid-cols-2 sm:gap-x-4">
                  {Object.entries(review.category_ratings).map(([key, val]) => (
                    <div key={key} className="flex min-w-0 items-center gap-1 text-xs text-yellow-500">
                      <span className="w-20 shrink-0 text-slate-600">
                        {key === 'time' ? '時間厳守' : key === 'attitude' ? '接客態度' : key === 'fan' ? 'ファンサービス' : key === 'play' ? '遊技姿勢' : key}
                      </span>
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} fill={i < (val as number) ? 'currentColor' : 'none'} />
                      ))}
                    </div>
                  ))}
                </div>
              )}
              <p className="whitespace-pre-wrap break-words leading-6 text-slate-700">
                {review.comment ? review.comment : 'コメントなし'}
              </p>
            </CardContent>
          </Card>
        ))
      )}
    </main>
  )
}
