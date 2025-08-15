import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Star } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { resolveActorContext } from '@/lib/resolveActorContext'

type TalentReview = {
  id: string
  store_name: string | null
  date: string | null
  rating: number
  category_ratings: any | null
  comment: string | null
}

export default async function TalentReviewPage() {
  const ctx = await resolveActorContext()
  if (ctx.role !== 'talent' || !ctx.talentId) {
    return <div className="max-w-screen-md mx-auto py-8">権限がありません。</div>
  }

  const supabase = createClient()
  let reviews: TalentReview[] = []
  try {
    const { data } = await supabase
      .from('reviews' as any)
      .select('id, rating, category_ratings, comment, created_at, stores(store_name), offers(date)')
      .eq('talent_id', ctx.talentId)
      .order('created_at', { ascending: false })

    reviews = (data || []).map((r: any) => ({
      id: r.id as string,
      store_name: r.stores?.store_name ?? null,
      date: r.offers?.date ?? null,
      rating: r.rating as number,
      category_ratings: r.category_ratings,
      comment: r.comment,
    }))
  } catch (e) {
    console.error('failed to fetch reviews', e)
  }

  return (
    <div className="max-w-screen-md mx-auto py-8 space-y-6">
      <h1 className="text-2xl font-bold mb-4">評価・レビュー一覧</h1>

      {reviews.length === 0 ? (
        <p>まだレビューがありません。</p>
      ) : (
        reviews.map(review => (
          <Card key={review.id}>
            <CardHeader>
              <CardTitle className="text-base">
                {review.store_name ?? '店舗不明'}（{review.date ?? '---'}）
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
                        {key === 'time'
                          ? '時間厳守'
                          : key === 'attitude'
                          ? '接客態度'
                          : key === 'fan'
                          ? 'ファンサービス'
                          : key === 'play'
                          ? '遊技姿勢'
                          : key}
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
