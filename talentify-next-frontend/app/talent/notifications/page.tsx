'use client'

import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Bell, Mail, Settings } from "lucide-react"

export default function TalentNotificationsPage() {
  // 仮通知データ
  const notifications = [
    { id: 1, icon: <Bell className="w-4 h-4 text-blue-500" />, title: "新しいオファーが届きました", date: "2025-07-15" },
    { id: 2, icon: <Mail className="w-4 h-4 text-green-500" />, title: "メールアドレスが認証されました", date: "2025-07-12" },
  ]

  return (
    <div className="max-w-screen-md mx-auto py-8 space-y-6">
      <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <Settings className="w-6 h-6" /> 通知・設定
      </h1>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">通知一覧</h2>
        <ul className="space-y-2">
          {notifications.map(n => (
            <li key={n.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-md border">
              {n.icon}
              <div>
                <p className="text-sm font-medium">{n.title}</p>
                <p className="text-xs text-gray-500">{n.date}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-4 pt-6 border-t">
        <h2 className="text-lg font-semibold">通知設定</h2>
        <div className="flex items-center justify-between">
          <Label htmlFor="email-notify">メール通知を受け取る</Label>
          <Switch id="email-notify" defaultChecked />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="line-notify">LINE通知を受け取る</Label>
          <Switch id="line-notify" />
        </div>
      </div>
    </div>
  )
}
