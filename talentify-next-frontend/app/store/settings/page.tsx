'use client'

import { useEffect, useState, useMemo, type ReactNode } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { SettingsTabs } from '@/components/settings/SettingsTabs'
import { SectionCard } from '@/components/settings/SectionCard'
import { ToggleRow } from '@/components/settings/ToggleRow'
import { toast } from 'sonner'

interface Settings {
  store_name: string
  contact_person: string
  email: string
  phone: string
}

function AccountSection() {
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 500))
    toast('（PR-1では）設定は未保存です/TODO')
    setSaving(false)
  }

  const handleTodo = () => toast('TODO: ダイアログ未実装')

  return (
    <SectionCard
      title="アカウント設定"
      description="メールやパスワードの変更は今後対応予定です。"
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
        <div className="flex justify-end pt-2">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? '保存中...' : '保存'}
          </Button>
        </div>
      </div>
    </SectionCard>
  )
}

function NotificationsSection() {
  const [saving, setSaving] = useState(false)
  const [toggles, setToggles] = useState({ email: false, sms: false })

  const handleSave = async () => {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 500))
    toast('（PR-1では）設定は未保存です/TODO')
    setSaving(false)
  }

  return (
    <SectionCard
      title="通知設定"
      description="通知のON/OFFは現在準備中です。"
    >
      <div className="divide-y">
        <ToggleRow
          id="store-notif-email"
          label="メール通知"
          description="この項目は今後有効になります（準備中）"
          checked={toggles.email}
          onCheckedChange={(v) => setToggles({ ...toggles, email: v })}
        />
        <ToggleRow
          id="store-notif-sms"
          label="SMS通知"
          description="この項目は今後有効になります（準備中）"
          checked={toggles.sms}
          onCheckedChange={(v) => setToggles({ ...toggles, sms: v })}
        />
      </div>
      <div className="flex justify-end pt-4">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? '保存中...' : '保存'}
        </Button>
      </div>
    </SectionCard>
  )
}

export default function StoreSettingsPage() {
  const supabase = useMemo(() => createClient(), [])
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState<Settings>({
    store_name: '',
    contact_person: '',
    email: '',
    phone: '',
  })

  const pathname = usePathname()
  const searchParams = useSearchParams()
  const tab = searchParams.get('tab') ?? 'store'

  const tabs = [
    { href: `${pathname}?tab=store`, label: '店舗情報' },
    { href: `${pathname}?tab=account`, label: 'アカウント設定' },
    { href: `${pathname}?tab=notifications`, label: '通知設定' },
  ]

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      const { data } = await supabase
        .from('stores')
        .select('store_name, contact_person, email, phone')
        .eq('user_id', user.id)
        .maybeSingle()

      const store = data as any
      if (store) {
        setSettings({
          store_name: store.store_name ?? '',
          contact_person: store.contact_person ?? '',
          email: store.email ?? '',
          phone: store.phone ?? '',
        })
      }
      setLoading(false)
    }
    load()
  }, [supabase])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings({ ...settings, [e.target.name]: e.target.value })
  }

  const handleSave = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (!settings.store_name.trim()) {
      alert('店舗名は必須です')
      return
    }

    const storeValues = { user_id: user.id, ...settings } as any
    const { error } = await supabase
      .from('stores')
      .upsert(storeValues, { onConflict: 'user_id' })

    if (error) {
      console.error('保存に失敗しました', error)
      alert(`保存に失敗しました: ${error.message}`)
      if (
        error.message.toLowerCase().includes('row level security') ||
        error.message.toLowerCase().includes('permission')
      ) {
        console.warn('RLS policy may prevent inserting/updating stores')
      }
    } else {
      toast.success('更新しました')
    }
  }

  const storeContent = (
    <SectionCard title="店舗情報">
      <div className="space-y-4">
        <div>
          <label className="block font-medium" htmlFor="store_name">
            店舗名
          </label>
          <Input
            id="store_name"
            name="store_name"
            value={settings.store_name}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block font-medium" htmlFor="contact_person">
            担当者名
          </label>
          <Input
            id="contact_person"
            name="contact_person"
            value={settings.contact_person}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block font-medium" htmlFor="email">
            メールアドレス
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            value={settings.email}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block font-medium" htmlFor="phone">
            電話番号
          </label>
          <Input id="phone" name="phone" value={settings.phone} onChange={handleChange} />
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSave}>保存</Button>
        </div>
      </div>
    </SectionCard>
  )

  let content: ReactNode
  if (tab === 'account') {
    content = <AccountSection />
  } else if (tab === 'notifications') {
    content = <NotificationsSection />
  } else {
    content = loading ? <p className="p-4">読み込み中...</p> : storeContent
  }

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">設定</h1>
      <SettingsTabs tabs={tabs} current={`${pathname}?tab=${tab}`} />
      {content}
    </main>
  )
}
