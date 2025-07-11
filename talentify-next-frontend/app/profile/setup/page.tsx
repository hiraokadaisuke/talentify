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
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (!user || error) {
        setError('ユーザー情報の取得に失敗しました')
        return
      }

      setProfile((prev: any) => ({
        ...prev,
        user_id: user.id,
        role: role || '', // role が未選択の時も空で入れておく
      }))

      setLoading(false)
    }

    fetchUser()
  }, [role])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    setError(null)

    const { error } = await supabase.from('profiles').upsert(profile)
    if (error) {
      setError('保存に失敗しました')
    } else {
      router.push('/dashboard')
    }
  }

  if (loading) return <p className="p-4">読み込み中...</p>

  // ✅ role パラメータがない場合：ロール選択画面を表示
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

  // ✅ roleがある場合：入力フォームを表示
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
            <Input name="store_name" value={profile.store_name || ''} onChange={handleChange} />
          </div>
          <div>
            <label className="block font-medium">担当者名</label>
            <Input name="staff_name" value={profile.staff_name || ''} onChange={handleChange} />
          </div>
          <div>
            <label className="block font-medium">店舗住所</label>
            <Textarea name="address" value={profile.address || ''} onChange={handleChange} />
          </div>
        </>
      ) : (
        <>
          <div>
            <label className="block font-medium">芸名</label>
            <Input name="stage_name" value={profile.stage_name || ''} onChange={handleChange} />
          </div>
          <div>
            <label className="block font-medium">自己紹介</label>
            <Textarea name="bio" value={profile.bio || ''} onChange={handleChange} />
          </div>
          <div>
            <label className="block font-medium">Twitter</label>
            <Input name="twitter" value={profile.twitter || ''} onChange={handleChange} />
          </div>
          <div>
            <label className="block font-medium">Instagram</label>
            <Input name="instagram" value={profile.instagram || ''} onChange={handleChange} />
          </div>
          <div>
            <label className="block font-medium">YouTube</label>
            <Input name="youtube" value={profile.youtube || ''} onChange={handleChange} />
          </div>
        </>
      )}

      <Button onClick={handleSubmit}>保存して進む</Button>
    </main>
  )
}
