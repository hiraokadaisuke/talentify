'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

const supabase = createClient()

export default function StoreProfileEditPage() {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState({
    display_name: '',
    bio: '',
    avatar_url: ''
  })

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('profiles')
        .select('display_name, bio, avatar_url')
        .eq('user_id', user.id)
        .single()

      if (data) setProfile(data)
      setLoading(false)
    }

    loadProfile()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value })
  }

  const handleSave = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('profiles').update(profile).eq('user_id', user.id)
    if (error) {
      alert('保存に失敗しました')
    } else {
      alert('保存しました')
    }
  }

  if (loading) return <p className="p-4">読み込み中...</p>

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">店舗プロフィール編集</h1>

      <div className="space-y-4">
        <div>
          <label className="block font-medium">店舗名（表示名）</label>
          <Input name="display_name" value={profile.display_name} onChange={handleChange} />
        </div>

        <div>
          <label className="block font-medium">自己紹介</label>
          <Textarea name="bio" value={profile.bio} onChange={handleChange} rows={4} />
        </div>

        <div>
          <label className="block font-medium">アバター画像URL</label>
          <Input name="avatar_url" value={profile.avatar_url} onChange={handleChange} type="url" />
        </div>

        <Button onClick={handleSave} className="mt-4">保存する</Button>
      </div>
    </main>
  )
}
