// components/ProfileProgressCard.tsx
'use client'

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { CheckCircle, AlertCircle } from "lucide-react"

const progressPercent = 60
const missingItems = [
  "SNSリンク",
  "自己紹介動画",
  "得意ジャンルの入力",
]

export default function ProfileProgressCard() {
  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-md">
      <CardHeader>
        <CardTitle className="text-base font-semibold">プロフィール進捗</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Progress value={progressPercent} />
          <div className="text-xs text-gray-600 mt-1">{progressPercent}% 完了</div>
        </div>

        {missingItems.length > 0 && (
          <div className="space-y-1 text-sm text-gray-700">
            <div className="flex items-center gap-1 text-red-600 font-medium">
              <AlertCircle className="w-4 h-4" /> 未入力項目：
            </div>
            <ul className="list-disc ml-5">
              {missingItems.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        <Button variant="default" size="sm" className="w-full">
          プロフィールを編集する
        </Button>
      </CardContent>
    </Card>
  )
}
