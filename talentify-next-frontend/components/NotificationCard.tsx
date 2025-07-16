// components/NotificationCard.tsx
'use client'

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BellDot, Info, AlertTriangle } from "lucide-react"

const dummyNotifications = [
  {
    id: 1,
    type: "重要",
    message: "出演スケジュールに変更があります",
    read: false,
  },
  {
    id: 2,
    type: "システム",
    message: "プラットフォームのメンテナンス予定（7/20）",
    read: true,
  },
  {
    id: 3,
    type: "お知らせ",
    message: "新機能：プロフィール動画の追加が可能になりました！",
    read: false,
  },
]

const typeBadge = (type: string) => {
  switch (type) {
    case "重要":
      return <Badge variant="destructive" className="flex items-center gap-1"><AlertTriangle className="w-4 h-4" /> 重要</Badge>
    case "システム":
      return <Badge variant="secondary" className="flex items-center gap-1"><Info className="w-4 h-4" /> システム</Badge>
    case "お知らせ":
      return <Badge variant="outline" className="flex items-center gap-1"><BellDot className="w-4 h-4" /> お知らせ</Badge>
    default:
      return null
  }
}

export default function NotificationCard() {
  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-md">
      <CardHeader>
        <CardTitle className="text-base font-semibold">通知・お知らせ</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {dummyNotifications.map((n) => (
          <div
            key={n.id}
            className={`p-3 border rounded-lg bg-white flex items-start gap-3 ${
              n.read ? "opacity-70" : "font-semibold text-gray-800"
            }`}
          >
            <div className="min-w-[90px]">{typeBadge(n.type)}</div>
            <div className="text-sm">{n.message}</div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
