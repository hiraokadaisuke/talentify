'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Star } from 'lucide-react'
import { getReviewsForTalent, TalentReview } from '@/utils/getReviewsForTalent'

export default function TalentReviewPage() {
  const [reviews, setReviews] = useState<TalentReview[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const data = await getReviewsForTalent()
      setReviews(data)
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className="max-w-screen-md mx-auto py-8 space-y-6">
      <h1 className="text-2xl font-bold mb-4">評価・レビュー一覧</h1>

      {loading ? (
        <p>読み込み中...</p>
      ) : reviews.length === 0 ? (
        <p>まだレビューがありません。</p>
      ) : (
        reviews.map(review => (
          <Card key={review.id}>
            <CardHeader>
              <CardTitle className="text-base">
                {review.store.name ?? '店舗不明'}（
                {new Date(review.created_at).toLocaleDateString('ja-JP', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                })}
                ）
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center gap-1 text-yellow-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill={i < review.rating ? 'currentColor' : 'none'} />
                ))}
                <span className="text-gray-500 ml-2">{review.rating} / 5</span>
              </div>
              {review.category_ratings && (
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  {Object.entries(review.category_ratings).map(([key, val]) => (
                    <div key={key} className="flex items-center gap-1 text-yellow-500 text-xs">
                      <span className="text-gray-600 w-16">
                        {key === 'time' ? '時間厳守' : key === 'attitude' ? '接客態度' : key === 'fan' ? 'ファンサービス' : key === 'play' ? '遊技姿勢' : key}
                      </span>
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} fill={i < (val as number) ? 'currentColor' : 'none'} />
                      ))}
                    </div>
                  ))}
                </div>
              )}
              <p className="text-gray-700">
                {review.comment ? review.comment : 'コメントなし'}
              </p>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
