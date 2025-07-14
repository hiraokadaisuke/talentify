'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

const supabase = createClient()

export default function ProfileSetupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const role = searchParams.get('role') // "store" または "talent"

  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>({})
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(false)
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    setError(null)

    // ユーザーIDの取得
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (!user || userError) {
      setError('ユーザー情報の取得に失敗しました')
      return
    }

    const user_id = user.id

    // ① 共通プロフィールを保存
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        user_id,
        role,
        display_name: role === 'store' ? profile.store_name : profile.stage_name || '',
      }, { onConflict: 'user_id' })

    if (profileError) {
      setError('プロフィールの保存に失敗しました')
      return
    }

    // ② ロールごとの追加情報を保存
    if (role === 'store') {
      const { error: storeError } = await supabase
        .from('stores')
        .upsert({
          user_id,
          store_name: profile.store_name,
          staff_name: profile.staff_name,
          address: profile.address,
        }, { onConflict: 'user_id' })

      if (storeError) {
        setError('店舗情報の保存に失敗しました')
        return
      }
    } else if (role === 'talent') {
      const { error: talentError } = await supabase
        .from('talents')
        .upsert({
          user_id,
          stage_name: profile.stage_name,
          bio: profile.bio,
          twitter: profile.twitter,
          instagram: profile.instagram,
          youtube: profile.youtube,
        }, { onConflict: 'user_id' })

      if (talentError) {
        setError('演者情報の保存に失敗しました')
        return
      }
    }

    // ③ 完了後にダッシュボードへ
    router.push('/dashboard')
  }

  if (loading) return <p className="p-4">読み込み中...</p>

  if (!role) {
    return (
      <main className="max-w-xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold">ロール選択</h1>
        <p className="text-gray-700">ご自身の区分を選んでください。</p>
        <div className="flex gap-4">
          <Button onClick={() => router.push('/profile/setup?role=store')}>
            店舗として登録
          </Button>
          <Button onClick={() => router.push('/profile/setup?role=talent')}>
            演者として登録
          </Button>
        </div>
      </main>
    )
  }

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">
        プロフィール登録（{role === 'store' ? '店舗' : '演者'}）
      </h1>

      {error && <p className="text-red-600">{error}</p>}

      {role === 'store' ? (
        <>
          <div>
            <label className="block font-medium">店舗名</label>
            <Input
              name="store_name"
              value={profile.store_name || ''}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block font-medium">担当者名</label>
            <Input
              name="staff_name"
              value={profile.staff_name || ''}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block font-medium">店舗住所</label>
            <Textarea
              name="address"
              value={profile.address || ''}
              onChange={handleChange}
            />
          </div>
        </>
      ) : (
        <>
          <div>
            <label className="block font-medium">芸名</label>
            <Input
              name="stage_name"
              value={profile.stage_name || ''}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block font-medium">自己紹介</label>
            <Textarea
              name="bio"
              value={profile.bio || ''}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block font-medium">Twitter</label>
            <Input
              name="twitter"
              value={profile.twitter || ''}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block font-medium">Instagram</label>
            <Input
              name="instagram"
              value={profile.instagram || ''}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block font-medium">YouTube</label>
            <Input
              name="youtube"
              value={profile.youtube || ''}
              onChange={handleChange}
            />
          </div>
        </>
      )}

      <Button onClick={handleSubmit}>保存して進む</Button>
    </main>
  )
}
