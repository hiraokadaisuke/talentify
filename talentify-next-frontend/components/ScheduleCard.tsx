// components/ScheduleCard.tsx
'use client'

import { CalendarCheck, Clock, AlertCircle } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const dummySchedule = [
  {
    date: "7月17日（水）",
    events: [
      {
        title: "グリーンパチンコ新宿店 来店実践",
        status: "confirmed",
      },
      {
        title: "撮影案件（午後）",
        status: "pending",
      },
    ],
  },
  {
    date: "7月18日（木）",
    events: [
      {
        title: "スロットキング大阪 SNS投稿",
        status: "cancelled",
      },
    ],
  },
]

export default function ScheduleCard() {
  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-md">
      <CardHeader>
        <CardTitle className="text-base font-semibold">今週の予定</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {dummySchedule.map((day, index) => (
          <div key={index}>
            <div className="text-sm font-semibold text-gray-700 mb-1">{day.date}</div>
            <div className="space-y-2">
              {day.events.map((event, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-white border rounded-lg px-4 py-2"
                >
                  <div className="text-sm text-gray-800">{event.title}</div>
                  {event.status === "confirmed" && (
                    <Badge variant="default" className="flex items-center gap-1">
                      <CalendarCheck className="w-4 h-4" /> 確定
                    </Badge>
                  )}
                  {event.status === "pending" && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Clock className="w-4 h-4" /> 保留
                    </Badge>
                  )}
                  {event.status === "cancelled" && (
                    <div className="flex items-center gap-1 text-red-600 text-sm font-medium">
                      <AlertCircle className="w-4 h-4" /> キャンセル
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
