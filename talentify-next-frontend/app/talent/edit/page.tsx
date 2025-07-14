'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

const supabase = createClient()

export default function TalentProfileEditPage() {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState({
    name: '',         // ← 本名
    stage_name: '',
    bio: '',
    twitter: '',
    instagram: '',
    youtube: ''
  })

  // プロフィール読み込み
  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('talents')
        .select('name, stage_name, bio, twitter, instagram, youtube')
        .eq('user_id', user.id)
        .maybeSingle()

      if (error) {
        console.error('プロフィールの取得に失敗:', error)
      }

      if (data) setProfile(data)
      setLoading(false)
    }

    loadProfile()
  }, [])

  // 入力変更ハンドラ
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value })
  }

  // 保存処理
  const handleSave = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return



    // 🔸 Step 2: talents テーブルに保存 or 更新
    const updateData = {
      user_id: user.id,
      name: profile.name || '',
      stage_name: profile.stage_name || '',
      bio: profile.bio || '',
      twitter: profile.twitter || '',
      instagram: profile.instagram || '',
      youtube: profile.youtube || ''
    }

    const { data: existing } = await supabase
      .from('talents')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    let error

    if (existing) {
      ({ error } = await supabase
        .from('talents')
        .update(updateData)
        .eq('user_id', user.id))
    } else {
      ({ error } = await supabase
        .from('talents')
        .insert(updateData))
    }

    if (error) {
      console.error('talents の保存に失敗:', error)
      alert('保存に失敗しました')
    } else {
      alert('保存しました')
    }
  }

  if (loading) return <p className="p-4">読み込み中...</p>

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">演者プロフィール編集</h1>

      <div className="space-y-4">
        <div>
          <label className="block font-semibold">本名</label>
          <input
            type="text"
            name="name"
            value={profile.name}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block font-semibold">芸名</label>
          <input
            type="text"
            name="stage_name"
            value={profile.stage_name}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block font-semibold">自己紹介</label>
          <textarea
            name="bio"
            value={profile.bio}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            rows={4}
          />
        </div>
        <div>
          <label className="block font-semibold">Twitter</label>
          <input
            type="url"
            name="twitter"
            value={profile.twitter}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block font-semibold">Instagram</label>
          <input
            type="url"
            name="instagram"
            value={profile.instagram}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block font-semibold">YouTube</label>
          <input
            type="url"
            name="youtube"
            value={profile.youtube}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <button
          onClick={handleSave}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          保存する
        </button>
      </div>
    </main>
  )
}
