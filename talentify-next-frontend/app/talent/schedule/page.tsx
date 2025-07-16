'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const mockSchedules = [
  { date: '2025-07-18', status: 'available' },
  { date: '2025-07-22', status: 'booked', store: 'グリーンホール渋谷' },
  { date: '2025-07-24', status: 'available' },
  { date: '2025-07-28', status: 'booked', store: 'キコーナ川崎' },
]

export default function SchedulePage() {
  return (
    <div className="max-w-screen-md mx-auto py-8 space-y-6">
      <h1 className="text-2xl font-bold mb-4">スケジュール管理</h1>

      <Card>
        <CardHeader>
          <CardTitle>今月のスケジュール</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          {mockSchedules.map((item, i) => (
            <div
              key={i}
              className="flex justify-between items-center border rounded px-4 py-2"
            >
              <div>
                <p className="font-medium">{item.date}</p>
                {item.status === 'booked' ? (
                  <p className="text-xs text-gray-500">
                    来店予定: {item.store}
                  </p>
                ) : (
                  <p className="text-xs text-green-600">空きあり</p>
                )}
              </div>
              {item.status === 'available' ? (
                <Badge variant="outline">募集中</Badge>
              ) : (
                <Badge variant="default">予定あり</Badge>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
