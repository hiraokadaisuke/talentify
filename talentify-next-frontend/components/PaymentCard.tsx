// components/PaymentCard.tsx
'use client'

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle2 } from "lucide-react"

const hasBankAccount = false

const appearances = [
  {
    id: 1,
    date: "7月10日",
    store: "パチンコグランド渋谷",
    amount: "￥30,000",
    status: "paid",
    transferDate: "7月15日",
  },
  {
    id: 2,
    date: "7月18日",
    store: "スロットキング梅田",
    amount: "￥35,000",
    status: "unpaid",
    transferDate: "7月25日予定",
  },
]

export default function PaymentCard() {
  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-md">
      <CardHeader>
        <CardTitle className="text-base font-semibold">ギャラ・報酬状況</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 text-sm">
        {!hasBankAccount && (
          <div className="flex items-center gap-2 text-red-600 text-xs font-medium">
            <AlertCircle className="w-4 h-4" />
            振込先口座が未設定です（設定してください）
          </div>
        )}

        {appearances.map((item) => (
          <div
            key={item.id}
            className="p-3 border rounded-md bg-white flex flex-col gap-1"
          >
            <div className="flex justify-between">
              <span className="font-medium text-gray-800">{item.store}</span>
              <span className="text-sm text-gray-500">{item.date}</span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span>{item.amount}</span>
              {item.status === "paid" ? (
                <Badge className="bg-green-100 text-green-700 border-green-300">
                  <CheckCircle2 className="w-4 h-4 mr-1" /> 入金済（{item.transferDate}）
                </Badge>
              ) : (
                <Badge variant="outline" className="text-yellow-700 border-yellow-300">
                  振込予定: {item.transferDate}
                </Badge>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
