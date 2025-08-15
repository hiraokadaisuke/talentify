'use client'

import { useState } from 'react'
import { SectionCard } from '@/components/settings/SectionCard'
import { ToggleRow } from '@/components/settings/ToggleRow'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function TalentSettingsPage() {
  const [saving, setSaving] = useState(false)
  const [notifications, setNotifications] = useState({ offer: false, message: false })

  const handleSave = async () => {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 500))
    toast('（PR-1では）設定は未保存です/TODO')
    setSaving(false)
  }

  const handleTodo = () => toast('TODO: ダイアログ未実装')

  return (
    <main className="max-w-screen-md mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">設定</h1>

      <SectionCard
        title="アカウント設定"
        description="メールやパスワードの変更は現在準備中です。"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm">メール変更</p>
              <p className="text-xs text-muted-foreground">
                この項目は今後有効になります（準備中）
              </p>
            </div>
            <Button variant="outline" onClick={handleTodo}>
              変更
            </Button>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm">パスワード変更</p>
              <p className="text-xs text-muted-foreground">
                この項目は今後有効になります（準備中）
              </p>
            </div>
            <Button variant="outline" onClick={handleTodo}>
              変更
            </Button>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="通知設定"
        description="通知のON/OFFは現在準備中です。"
      >
        <div className="divide-y">
          <ToggleRow
            id="talent-notif-offer"
            label="オファー通知"
            description="この項目は今後有効になります（準備中）"
            checked={notifications.offer}
            onCheckedChange={(v) => setNotifications({ ...notifications, offer: v })}
          />
          <ToggleRow
            id="talent-notif-message"
            label="メッセージ通知"
            description="この項目は今後有効になります（準備中）"
            checked={notifications.message}
            onCheckedChange={(v) => setNotifications({ ...notifications, message: v })}
          />
        </div>
      </SectionCard>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? '保存中...' : '保存'}
        </Button>
      </div>
    </main>
  )
}
