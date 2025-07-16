// components/ReviewCard.tsx
'use client'

import { Star } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const averageScore = 4.6
const reviewCount = 18

const latestReviews = [
  {
    id: 1,
    content: "丁寧な立ち回りと笑顔がとても好印象でした！",
    goodPoints: ["清潔感あり", "対応が丁寧", "SNS投稿が的確"],
  },
  {
    id: 2,
    content: "トークがやや緊張気味だったが、真面目さが伝わった",
    improvementPoints: ["もっとリラックスして話せると◎"],
  },
]

export default function ReviewCard() {
  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-md">
      <CardHeader>
        <CardTitle className="text-base font-semibold">評価・レビュー</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-500" />
          <span className="text-lg font-bold">{averageScore}</span>
          <span className="text-xs text-gray-500">（{reviewCount} 件）</span>
        </div>

        {latestReviews.map((r) => (
          <div key={r.id} className="border rounded-md p-3 bg-white space-y-1">
            <p className="text-gray-800">{r.content}</p>

            {r.goodPoints && (
              <div className="flex flex-wrap gap-1">
                {r.goodPoints.map((tag, i) => (
                  <Badge key={i} variant="outline" className="text-xs text-green-700 border-green-300">
                    👍 {tag}
                  </Badge>
                ))}
              </div>
            )}

            {r.improvementPoints && (
              <div className="flex flex-wrap gap-1">
                {r.improvementPoints.map((tag, i) => (
                  <Badge key={i} variant="secondary" className="text-xs text-red-600 border-red-300">
                    🛠️ {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
