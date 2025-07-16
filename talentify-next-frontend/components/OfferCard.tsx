// components/OfferCard.tsx
'use client'

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const dummyOffers = [
  {
    id: 1,
    storeName: "グリーンパチンコ新宿店",
    summary: "7月20日の実践来店依頼",
    deadline: "2025-07-18",
    remaining: "あと2日",
  },
  {
    id: 2,
    storeName: "パチンコワールド名古屋",
    summary: "イベント付き収録案件",
    deadline: "2025-07-19",
    remaining: "あと3日",
  },
  {
    id: 3,
    storeName: "スロットキング大阪",
    summary: "来店＋SNS投稿依頼",
    deadline: "2025-07-20",
    remaining: "あと4日",
  },
]

export default function OfferCard() {
  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-md">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold">
          未対応のオファー
        </CardTitle>
        <Badge variant="outline">{dummyOffers.length}件</Badge>
      </CardHeader>

      <CardContent className="space-y-4">
        {dummyOffers.map((offer) => (
          <div
            key={offer.id}
            className="border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-white"
          >
            <div>
              <div className="font-medium text-gray-800">{offer.storeName}</div>
              <div className="text-sm text-gray-500">{offer.summary}</div>
              <div className="text-xs text-red-500 mt-1">
                対応期限: {offer.deadline}（{offer.remaining}）
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" size="sm">辞退</Button>
              <Button size="sm">承諾</Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
