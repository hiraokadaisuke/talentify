'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Star } from "lucide-react"

export default function TalentReviewPage() {
  // 仮データ（後で Supabase に置き換え）
  const reviews = [
    {
      store: "パチンコMAX渋谷",
      date: "2025年7月10日",
      rating: 5,
      comment: "場の空気を一気に明るくしてくれました！またお願いします！"
    },
    {
      store: "スロットキング新宿",
      date: "2025年6月22日",
      rating: 4,
      comment: "丁寧な対応が好印象でした。次回はもっとSNSでも発信してほしいです。"
    }
  ]

  return (
    <div className="max-w-screen-md mx-auto py-8 space-y-6">
      <h1 className="text-2xl font-bold mb-4">評価・レビュー一覧</h1>

      {reviews.map((review, idx) => (
        <Card key={idx}>
          <CardHeader>
            <CardTitle className="text-base">
              {review.store}（{review.date}）
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center gap-1 text-yellow-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} fill={i < review.rating ? "currentColor" : "none"} />
              ))}
              <span className="text-gray-500 ml-2">{review.rating} / 5</span>
            </div>
            <p className="text-gray-700">{review.comment}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
