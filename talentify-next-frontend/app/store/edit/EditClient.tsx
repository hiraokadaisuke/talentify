'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

const supabase = createClient()

export default function StoreProfileEditPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isNew, setIsNew] = useState(false)
  const [profile, setProfile] = useState({
    store_name: '',
    bio: '',
    avatar_url: ''
  })
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [showIncomplete, setShowIncomplete] = useState(false)

  useEffect(() => {
    const loadProfile = async () => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()
      if (authError || !user) {
        console.error('ユーザー取得失敗:', authError)
        setErrorMessage('ユーザー情報の取得に失敗しました')
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('stores')
        .select('store_name, bio, avatar_url, is_setup_complete')
        .eq('user_id', user.id)
        .maybeSingle()

      if (error) {
        console.error('プロフィール読み込みエラー:', {
          message: error?.message,
          details: error?.details,
          hint: error?.hint,
        })
        setErrorMessage('プロフィールの取得に失敗しました')
      }

      if (data) {
        setProfile({
          store_name: data.store_name ?? '',
          bio: data.bio ?? '',
          avatar_url: data.avatar_url ?? '',
        })
        setIsNew(false)
        setShowIncomplete(!data.is_setup_complete)
      } else {
        setIsNew(true)
        setShowIncomplete(true)
      }
      setLoading(false)
    }

    loadProfile()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value })
  }

  const handleSave = async () => {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      console.error('ユーザー取得失敗:', authError)
      setErrorMessage('ユーザー情報の取得に失敗しました')
      return
    }

    if (!profile.store_name.trim()) {
      setErrorMessage('店舗名（表示名）は必須です')
      return
    }

    console.log('📝 保存データ（送信前）:', {
      ...profile,
      user_id: user.id,
    })

    const updateData = {
      store_name: profile.store_name,
      bio: profile.bio || null,
      avatar_url: profile.avatar_url || null,
      user_id: user.id,
      is_setup_complete: true,
    }

    const { error } = await supabase
      .from('stores')
      .upsert(updateData, { onConflict: 'user_id' })

    if (error) {
      console.error('🔥 Supabase更新エラー:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      })
      setErrorMessage(`保存に失敗しました: ${error.message}`)
      if (
        error.message.toLowerCase().includes('row level security') ||
        error.message.toLowerCase().includes('permission')
      ) {
        console.warn('RLS policy may prevent inserting/updating stores')
      }
    } else {
      console.log('✅ プロフィール保存成功')
      setShowIncomplete(false)
      if (isNew) {
        router.push('/store/edit/complete')
      } else {
        router.push('/dashboard?saved=1')
      }
    }
  }

  if (loading) return <p className="p-4">読み込み中...</p>

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-6">
      {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}
      {showIncomplete && !errorMessage && (
        <div className="rounded bg-yellow-100 p-2 text-yellow-800">
          プロフィールが未完成です
        </div>
      )}
      <h1 className="text-2xl font-bold">店舗プロフィール編集</h1>

      <div className="space-y-4">
        <div>
          <label className="block font-medium">店舗名（表示名）</label>
          <Input name="store_name" value={profile.store_name} onChange={handleChange} />
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
