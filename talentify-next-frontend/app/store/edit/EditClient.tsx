'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { toast } from 'sonner'

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp'] as const
const MAX_FILE_SIZE = 5 * 1024 * 1024
const AVATAR_BUCKET = 'talent-photos'

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
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [showIncomplete, setShowIncomplete] = useState(false)
  const [errors, setErrors] = useState<{ avatar?: string }>({})
  const [saving, setSaving] = useState(false)
  const avatarPreview = useMemo(
    () => (avatarFile ? URL.createObjectURL(avatarFile) : profile.avatar_url),
    [avatarFile, profile.avatar_url]
  )

  const getMimeAndExt = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase()
    let type = file.type
    if (!type && ext) {
      if (ext === 'png') type = 'image/png'
      else if (ext === 'jpg' || ext === 'jpeg') type = 'image/jpeg'
      else if (ext === 'webp') type = 'image/webp'
    }
    if (!type || !ALLOWED_TYPES.includes(type as any)) {
      throw new Error('対応形式は PNG・JPG・WEBP です。')
    }
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('ファイルサイズは 5MB までです。')
    }
    const extension = type === 'image/png' ? 'png' : type === 'image/webp' ? 'webp' : 'jpg'
    return { type, ext: extension }
  }

  const uploadAvatar = async (file: File, user: string) => {
    const { type, ext } = getMimeAndExt(file)
    const path = `avatars/${user}/avatar-${Date.now()}.${ext}`
    const { error: upErr } = await supabase.storage
      .from(AVATAR_BUCKET)
      .upload(path, file, { upsert: true, contentType: type, cacheControl: '3600' })
    if (upErr) throw upErr
    const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path)
    return data.publicUrl
  }

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

  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      getMimeAndExt(file)
      setAvatarFile(file)
      setErrors({})
    } catch (err: any) {
      toast.error(err.message)
      setErrors({ avatar: err.message })
      e.target.value = ''
    }
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

    setSaving(true)
    try {
      let avatarUrl = profile.avatar_url
      if (avatarFile) {
        avatarUrl = await uploadAvatar(avatarFile, user.id)
        setProfile((p) => ({ ...p, avatar_url: avatarUrl }))
      }

      console.log('📝 保存データ（送信前）:', {
        ...profile,
        avatar_url: avatarUrl,
        user_id: user.id,
      })

      const updateData = {
        store_name: profile.store_name,
        bio: profile.bio || null,
        avatar_url: avatarUrl || null,
        user_id: user.id,
        is_setup_complete: true,
      }

      const { error } = await supabase
        .from('stores')
        .upsert(updateData, { onConflict: 'user_id' })

      if (error) throw error

      toast.success('保存しました')
      setShowIncomplete(false)
      if (isNew) {
        router.push('/store/edit/complete')
      } else {
        router.push('/dashboard?saved=1')
      }
    } catch (error: any) {
      console.error('🔥 Supabase更新エラー:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      })
      setErrorMessage(`保存に失敗しました: ${error.message}`)
      toast.error('保存に失敗しました')
      if (
        error.message?.toLowerCase().includes('row level security') ||
        error.message?.toLowerCase().includes('permission')
      ) {
        console.warn('RLS policy may prevent inserting/updating stores')
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="p-4">読み込み中...</p>

  return (
    <main className="bg-gray-100 px-4 py-8 sm:px-6">
      <div className="mx-auto w-full max-w-2xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
        {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}
        {showIncomplete && !errorMessage && (
          <div className="rounded-lg bg-yellow-100 p-2 text-sm text-yellow-800">
            プロフィールが未完成です
          </div>
        )}
        <h1 className="text-xl font-semibold">店舗プロフィール編集</h1>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">店舗名（表示名）</label>
            <Input
              name="store_name"
              value={profile.store_name}
              onChange={handleChange}
              className="rounded-lg border border-gray-300 bg-white focus-visible:ring-2 focus-visible:ring-blue-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium">自己紹介</label>
            <Textarea
              name="bio"
              value={profile.bio}
              onChange={handleChange}
              rows={4}
              className="rounded-lg border border-gray-300 bg-white focus-visible:ring-2 focus-visible:ring-blue-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium">アバター画像</label>
            {avatarPreview && (
              <img
                src={avatarPreview}
                alt="avatar preview"
                className="mb-2 h-24 w-24 rounded-lg object-cover"
              />
            )}
            <Input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleAvatar}
              className="rounded-lg border border-gray-300 bg-white focus-visible:ring-2 focus-visible:ring-blue-500"
            />
            <p className="text-sm text-gray-500">5MBまで／対応：PNG・JPG・WEBP</p>
            {errors.avatar && <p className="text-sm text-red-500">{errors.avatar}</p>}
          </div>

          <Button
            onClick={handleSave}
            className="mt-4 w-full bg-blue-600 text-white hover:bg-blue-700"
            disabled={saving}
          >
            {saving ? '保存中...' : '保存する'}
          </Button>
        </div>
      </div>
    </main>
  )
}
