'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { SectionCard } from '@/components/settings/SectionCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export default function TalentSettingsPage() {
  const [saving, setSaving] = useState(false)
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
      if (!res.ok) return
      const data = await res.json()
      setBankInfo({
        bank_name: data.bank_name ?? '',
        branch_name: data.branch_name ?? '',
        account_type: data.account_type ?? '',
        account_number: data.account_number ?? '',
        account_holder: data.account_holder ?? '',
      })
    }
    void fetchProfile()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/talent/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bankInfo),
      })
      if (!res.ok) throw new Error('failed')
      toast.success('振込先を保存しました')
    } catch {
      toast.error('保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="mx-auto max-w-screen-md space-y-6 p-4">
      <h1 className="text-2xl font-bold">設定</h1>

      <SectionCard title="振込先" description="請求・支払いに利用する銀行口座情報です">
        <div className="space-y-4">
          {[
            ['bank_name', '銀行名'],
            ['branch_name', '支店名'],
            ['account_type', '口座種別'],
            ['account_number', '口座番号'],
            ['account_holder', '口座名義人'],
          ].map(([key, label]) => (
            <div className="space-y-2" key={key}>
              <Label htmlFor={key}>{label}</Label>
              <Input
                id={key}
                value={bankInfo[key as keyof typeof bankInfo]}
                onChange={(e) => setBankInfo({ ...bankInfo, [key]: e.target.value })}
              />
            </div>
          ))}
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? '保存中...' : '振込先を保存'}
            </Button>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="パスワード" description="登録メールアドレスへ再設定リンクを送信します">
        <Button asChild variant="outline">
          <Link href="/password-reset">パスワードを再設定</Link>
        </Button>
      </SectionCard>
    </main>
  )
}
