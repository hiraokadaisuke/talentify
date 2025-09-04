'use client'

import { useState, useEffect } from 'react'
import { SectionCard } from '@/components/settings/SectionCard'
import { ToggleRow } from '@/components/settings/ToggleRow'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export default function TalentSettingsPage() {
  const [saving, setSaving] = useState(false)
  const [notifications, setNotifications] = useState({ offer: false, message: false })
  const [bankInfo, setBankInfo] = useState({
    bank_name: '',
    branch_name: '',
    account_type: '',
    account_number: '',
    account_holder: '',
  })

  useEffect(() => {
    const fetchProfile = async () => {
      const res = await fetch('/api/talent/profile')
      if (res.ok) {
        const data = await res.json()
        setBankInfo({
          bank_name: data.bank_name ?? '',
          branch_name: data.branch_name ?? '',
          account_type: data.account_type ?? '',
          account_number: data.account_number ?? '',
          account_holder: data.account_holder ?? '',
        })
      }
    }
    fetchProfile()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    const res = await fetch('/api/talent/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bankInfo),
    })
    if (res.ok) {
      toast('保存しました')
    } else {
      toast('保存に失敗しました')
    }
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

      <SectionCard title="振込先" description="銀行口座情報を設定します">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bank_name">銀行名</Label>
            <Input
              id="bank_name"
              value={bankInfo.bank_name}
              onChange={(e) => setBankInfo({ ...bankInfo, bank_name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="branch_name">支店名</Label>
            <Input
              id="branch_name"
              value={bankInfo.branch_name}
              onChange={(e) => setBankInfo({ ...bankInfo, branch_name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="account_type">口座種別</Label>
            <Input
              id="account_type"
              value={bankInfo.account_type}
              onChange={(e) => setBankInfo({ ...bankInfo, account_type: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="account_number">口座番号</Label>
            <Input
              id="account_number"
              value={bankInfo.account_number}
              onChange={(e) => setBankInfo({ ...bankInfo, account_number: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="account_holder">口座名義人</Label>
            <Input
              id="account_holder"
              value={bankInfo.account_holder}
              onChange={(e) => setBankInfo({ ...bankInfo, account_holder: e.target.value })}
            />
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
