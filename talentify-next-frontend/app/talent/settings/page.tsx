'use client'

import { useState } from 'react'
import { SectionCard } from '@/components/settings/SectionCard'
import { ToggleRow } from '@/components/settings/ToggleRow'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function TalentSettingsPage() {
  const [email, setEmail] = useState('')
  const [notifications, setNotifications] = useState({
    offer: true,
    schedule: true,
    payment: true,
  })
  const [bank, setBank] = useState({
    bankName: '',
    branch: '',
    type: '',
    number: '',
    holder: '',
  })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      // TODO: API未接続
      toast.success('保存しました')
    } catch (e) {
      toast.error('保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="max-w-screen-md mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">設定</h1>

      <SectionCard title="アカウント設定">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">ログインメール</Label>
            <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <p className="text-xs text-muted-foreground">ログインに使用されます</p>
          </div>
          <Button type="button" variant="outline">
            パスワード変更
          </Button>
          <Button type="button" variant="outline">
            2段階認証（未対応）
          </Button>
        </div>
      </SectionCard>

      <SectionCard title="通知設定">
        <div className="divide-y">
          <ToggleRow
            id="offer"
            label="オファー受信通知"
            checked={notifications.offer}
            onCheckedChange={(v) => setNotifications({ ...notifications, offer: v })}
          />
          <ToggleRow
            id="schedule"
            label="スケジュール変更通知"
            checked={notifications.schedule}
            onCheckedChange={(v) => setNotifications({ ...notifications, schedule: v })}
          />
          <ToggleRow
            id="payment"
            label="支払いステータス通知"
            checked={notifications.payment}
            onCheckedChange={(v) => setNotifications({ ...notifications, payment: v })}
          />
        </div>
      </SectionCard>

      <SectionCard title="受取口座" description="現在は保存されません">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bankName">銀行名</Label>
              <Input
                id="bankName"
                value={bank.bankName}
                onChange={(e) => setBank({ ...bank, bankName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="branch">支店名</Label>
              <Input id="branch" value={bank.branch} onChange={(e) => setBank({ ...bank, branch: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">口座種別</Label>
              <Input id="type" value={bank.type} onChange={(e) => setBank({ ...bank, type: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="number">口座番号</Label>
              <Input
                id="number"
                value={bank.number}
                onChange={(e) =>
                  setBank({ ...bank, number: e.target.value.replace(/[^0-9]/g, '') })
                }
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="holder">口座名義</Label>
              <Input id="holder" value={bank.holder} onChange={(e) => setBank({ ...bank, holder: e.target.value })} />
            </div>
          </div>
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

