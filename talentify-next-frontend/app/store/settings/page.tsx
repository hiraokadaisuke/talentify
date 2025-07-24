'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface Settings {
  store_name: string
  contact_person: string
  email: string
  phone: string
}

export default function StoreSettingsPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState<Settings>({
    store_name: '',
    contact_person: '',
    email: '',
    phone: '',
  })
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

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
  }, [])

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
      setToast('更新しました')
      setTimeout(() => setToast(null), 3000)
    }
  }

  if (loading) return <p className="p-4">読み込み中...</p>

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">店舗設定</h1>

      <div className="space-y-4">
        <div>
          <label className="block font-medium">店舗名</label>
          <Input name="store_name" value={settings.store_name} onChange={handleChange} />
        </div>
        <div>
          <label className="block font-medium">担当者名</label>
          <Input name="contact_person" value={settings.contact_person} onChange={handleChange} />
        </div>
        <div>
          <label className="block font-medium">メールアドレス</label>
          <Input name="email" type="email" value={settings.email} onChange={handleChange} />
        </div>
        <div>
          <label className="block font-medium">電話番号</label>
          <Input name="phone" value={settings.phone} onChange={handleChange} />
        </div>
        <Button onClick={handleSave} className="mt-2">保存</Button>
      </div>

      {toast && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded shadow">
          {toast}
        </div>
      )}
    </main>
  )
}

