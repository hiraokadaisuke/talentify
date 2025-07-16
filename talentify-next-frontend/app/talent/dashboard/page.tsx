'use client'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import Link from 'next/link'

export default function TalentDashboard() {
  return (
    <div className="grid grid-cols-9 gap-6 py-8 max-w-screen-xl mx-auto">
      {/* 中央カラム：主要情報 */}
      <main className="col-span-5 space-y-6">
        {/* A: 未対応のオファー */}
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>未対応のオファー</span>
              <Badge variant="destructive">3件</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between items-center border rounded px-3 py-2">
              <div>
                <p className="font-medium">パチンコMAX秋葉原</p>
                <p className="text-xs text-gray-500">来店＋SNS投稿</p>
              </div>
              <Button size="sm">詳細を見る</Button>
            </div>
            {/* 他2件も同様の形式でOK */}
          </CardContent>
        </Card>

        {/* B: 今週のスケジュール */}
        <Card>
          <CardHeader>
            <CardTitle>今週の予定</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span>7月17日（水）</span>
              <Badge>確定</Badge>
            </div>
            <div className="flex justify-between items-center text-red-600">
              <span>7月19日（金）</span>
              <Badge variant="outline">変更あり</Badge>
            </div>
          </CardContent>
        </Card>

        {/* C: 通知・お知らせ */}
        <Card>
          <CardHeader>
            <CardTitle>お知らせ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <Badge className="mr-2">システム</Badge>
              プロフィール機能が更新されました
            </div>
            <div>
              <Badge className="mr-2" variant="destructive">重要</Badge>
              銀行口座の登録が必要です
            </div>
          </CardContent>
        </Card>
      </main>

      {/* 右カラム：補助情報 */}
      <aside className="col-span-4 space-y-6">
        {/* D: プロフィール進捗 */}
        <Card>
          <CardHeader>
            <CardTitle>プロフィール進捗</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={70} className="mb-2" />
            <p className="text-xs text-gray-500 mb-2">未入力項目：SNSリンク、動画</p>
            <Button size="sm" variant="outline">プロフィールを編集</Button>
          </CardContent>
        </Card>

        {/* E: 評価・レビュー */}
        <Card>
          <CardHeader>
            <CardTitle>評価・レビュー</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <p>平均スコア：<span className="font-bold">4.6</span> / 5</p>
            <p className="mt-2 text-gray-600">「明るくて盛り上げ上手！」</p>
          </CardContent>
        </Card>

        {/* F: ギャラ状況 */}
        <Link href="/talent/payments">
          <Card className="hover:shadow-md transition cursor-pointer">
            <CardHeader>
              <CardTitle>今月のギャラ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>7/10 渋谷</span>
                <span className="text-green-600 font-semibold">¥30,000</span>
              </div>
              <div className="flex justify-between">
                <span>7/18 梅田</span>
                <span className="text-yellow-600 font-semibold">¥35,000</span>
              </div>
              <p className="text-xs text-red-600 mt-1">※ 振込先未設定</p>
            </CardContent>
          </Card>
        </Link>
      </aside>
    </div>
  )
}
