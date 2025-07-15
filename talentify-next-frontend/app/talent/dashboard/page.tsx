'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Calendar } from '@/components/ui/calendar'

const mockNotifications = {
  offers: 2,
  messages: 3,
  events: 1,
}

const upcomingEvents = [
  { date: '2025-07-01', title: 'イベントA' },
  { date: '2025-07-15', title: 'イベントB' },
]

const pendingOffers = [
  { id: 1, title: '出演依頼1' },
  { id: 2, title: '出演依頼2' },
]

export default function DashboardPage() {
  const [offers, setOffers] = useState(pendingOffers)

  const handleStatus = async (id: number, status: 'accepted' | 'rejected') => {
    try {
      const res = await fetch(`/api/offers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(errorText)
      }

      setOffers((prev) => prev.filter((o) => o.id !== id))
    } catch (err: any) {
      alert(`更新に失敗しました: ${err.message}`)
    }
  }

  return (
    <div className="p-4 space-y-6">
      {/* ヘッダー */}
      <div>
        <h1 className="text-2xl font-semibold">Welcome, Alice!</h1>
        <p className="text-muted-foreground text-sm">今日も頑張りましょう</p>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-r from-cyan-200 to-blue-200 text-white shadow">
          <CardContent className="p-6">
            <p className="text-sm">CV Views</p>
            <p className="text-3xl font-bold mt-2">12</p>
            <p className="text-xs mt-1 text-white/80">+1.2% than last month</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-pink-200 to-purple-200 text-white shadow">
          <CardContent className="p-6">
            <p className="text-sm">Applications Submitted</p>
            <p className="text-3xl font-bold mt-2">5</p>
            <p className="text-xs mt-1 text-white/80">-1.3% than last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">通知数</p>
            <p className="text-3xl font-bold mt-2">
              {mockNotifications.offers + mockNotifications.messages + mockNotifications.events}
            </p>
            <p className="text-xs mt-1 text-muted-foreground">合計通知件数</p>
          </CardContent>
        </Card>
      </div>

      {/* 通知 & スケジュール */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* 通知カード */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>通知</span>
              <Badge>{mockNotifications.offers} オファー</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Alert>
              <AlertTitle>メッセージ</AlertTitle>
              <AlertDescription>
                未読メッセージ {mockNotifications.messages} 件
              </AlertDescription>
            </Alert>
            <Alert>
              <AlertTitle>イベント</AlertTitle>
              <AlertDescription>
                近日予定 {mockNotifications.events} 件
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* スケジュールカード */}
        <Card>
          <CardHeader>
            <CardTitle>スケジュール</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar events={upcomingEvents} />
            <Link
              href="/schedule"
              className="text-blue-600 underline text-sm mt-2 block"
            >
              スケジュール詳細
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* オファー一覧 */}
      <Card>
        <CardHeader>
          <CardTitle>保留中のオファー</CardTitle>
        </CardHeader>
        <CardContent>
          {offers.length === 0 ? (
            <p>現在保留中のオファーはありません。</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th className="py-1">タイトル</th>
                  <th className="py-1">操作</th>
                </tr>
              </thead>
              <tbody>
                {offers.map((o) => (
                  <tr key={o.id} className="border-t">
                    <td className="py-2">{o.title}</td>
                    <td className="py-2 space-x-2">
                      <button className="text-blue-600">詳細確認</button>
                      <button
                        className="text-green-600"
                        onClick={() => handleStatus(o.id, 'accepted')}
                      >
                        承諾
                      </button>
                      <button
                        className="text-red-600"
                        onClick={() => handleStatus(o.id, 'rejected')}
                      >
                        辞退
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* プロフィール情報 */}
      <Card>
        <CardHeader>
          <CardTitle>プロフィール</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center space-x-2">
            <span>公開設定:</span>
            <Badge variant="secondary">公開</Badge>
          </div>
          <div>平均評価: ★★★★☆</div>
          <div className="space-x-4">
            <Link href="/profile/edit" className="text-blue-600 underline">
              プロフィール編集
            </Link>
            <Link href="/reviews" className="text-blue-600 underline">
              レビューを見る
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
