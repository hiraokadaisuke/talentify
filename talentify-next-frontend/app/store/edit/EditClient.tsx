'use client'

import { useCallback, useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { toast } from 'sonner'
import { AlertCircle, RotateCcw } from 'lucide-react'

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp'] as const
const MAX_FILE_SIZE = 5 * 1024 * 1024
const AVATAR_BUCKET = 'talent-photos'

const supabase = createClient()

const PREFECTURES = [
  '北海道','青森県','岩手県','宮城県','秋田県','山形県','福島県',
  '茨城県','栃木県','群馬県','埼玉県','千葉県','東京都','神奈川県',
  '新潟県','富山県','石川県','福井県','山梨県','長野県',
  '岐阜県','静岡県','愛知県','三重県',
  '滋賀県','京都府','大阪府','兵庫県','奈良県','和歌山県',
  '鳥取県','島根県','岡山県','広島県','山口県',
  '徳島県','香川県','愛媛県','高知県',
  '福岡県','佐賀県','長崎県','熊本県','大分県','宮崎県','鹿児島県','沖縄県',
] as const

export default function StoreProfileEditPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [isNew, setIsNew] = useState(false)
  const [profile, setProfile] = useState({
    store_name: '',
    store_prefect: '',
    store_address: '',
    bio: '',
    avatar_url: ''
  })
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [showIncomplete, setShowIncomplete] = useState(false)
  const [errors, setErrors] = useState<{ store_name?: string; store_prefect?: string; store_address?: string; avatar?: string }>({})
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

  const loadProfile = useCallback(async () => {
    setLoading(true)
    setLoadError(false)
    setErrorMessage(null)

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        console.error('ユーザー取得失敗:', authError)
        throw authError ?? new Error('Authenticated user not found')
      }

      const { data, error } = await supabase
        .from('stores')
        .select('store_name, store_prefect, store_address, bio, avatar_url, is_setup_complete')
        .eq('user_id', user.id)
        .maybeSingle()

      if (error) {
        console.error('プロフィール読み込みエラー:', {
          message: error?.message,
          details: error?.details,
          hint: error?.hint,
        })
        throw error
      }

      if (data) {
        setProfile({
          store_name: data.store_name ?? '',
          store_prefect: data.store_prefect ?? '',
          store_address: data.store_address ?? '',
          bio: data.bio ?? '',
          avatar_url: data.avatar_url ?? '',
        })
        setIsNew(false)
        setShowIncomplete(!data.is_setup_complete)
      } else {
        setIsNew(true)
        setShowIncomplete(true)
      }
    } catch (error) {
      console.error('店舗プロフィールの読み込みに失敗:', error)
      setLoadError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadProfile()
  }, [loadProfile])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

    const nextErrors: typeof errors = {}
    if (!profile.store_name.trim()) {
      nextErrors.store_name = '店舗名を入力してください'
    }
    if (!profile.store_prefect.trim()) {
      nextErrors.store_prefect = '都道府県を選択してください'
    }
    if (!profile.store_address.trim()) {
      nextErrors.store_address = '市区町村・番地まで住所を入力してください'
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors((current) => ({ ...current, ...nextErrors }))
      setErrorMessage('必須項目を入力してください')
      return
    }

    setErrors((current) => ({
      ...current,
      store_name: undefined,
      store_prefect: undefined,
      store_address: undefined,
    }))
    setErrorMessage(null)
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
        store_name: profile.store_name.trim(),
        store_prefect: profile.store_prefect.trim(),
        store_address: profile.store_address.trim(),
        bio: profile.bio || null,
        avatar_url: avatarUrl || null,
        user_id: user.id,
        is_setup_complete: true,
        is_profile_complete: true,
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

  if (loadError) {
    return (
      <main className="py-2 sm:py-4">
        <div className="mx-auto w-full max-w-5xl lg:max-w-6xl">
          <h1 className="mb-2 text-2xl font-bold tracking-tight sm:mb-6 sm:text-3xl">
          {showIncomplete ? '店舗情報を登録' : '店舗プロフィール編集'}
        </h1>
        {showIncomplete && (
          <p className="mb-5 text-sm leading-6 text-slate-600">
            店舗名・都道府県・住所を登録すると利用を開始できます。自己紹介や画像はあとから追加できます。
          </p>
        )}
          <div
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 px-5 py-8 text-center shadow-sm"
          >
            <AlertCircle className="mx-auto h-7 w-7 text-red-600" aria-hidden="true" />
            <h2 className="mt-3 text-base font-semibold text-red-900">
              プロフィールを読み込めませんでした
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-red-700">
              既存プロフィールを保護するため、編集フォームは表示していません。通信状況を確認して、もう一度お試しください。
            </p>
            <Button
              type="button"
              variant="outline"
              className="mt-5 min-h-10"
              onClick={() => void loadProfile()}
            >
              <RotateCcw className="mr-1.5 h-4 w-4" aria-hidden="true" />
              再読み込み
            </Button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="py-2 sm:py-4">
      <div className="mx-auto w-full max-w-5xl lg:max-w-6xl">
        <section className="mb-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,.05)]">
          <div className="p-5 sm:p-6">
            <p className="text-[11px] font-black tracking-[0.16em] text-[#C2410C]">STORE PROFILE</p>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
              {showIncomplete ? '店舗情報を登録' : '店舗プロフィール編集'}
            </h1>
            <p className="mt-1 text-sm leading-6 text-slate-500">一般ユーザーの地域・店舗検索にも使われる店舗情報を管理します。</p>
          </div>
          <div className="h-1 bg-gradient-to-r from-[#FF3B2E] via-[#FF8A00] to-[#FFC400]" />
        </section>
        {showIncomplete && (
          <p className="mb-5 text-sm leading-6 text-slate-600">
            店舗名・都道府県・住所を登録すると利用を開始できます。自己紹介や画像はあとから追加できます。
          </p>
        )}
        <section className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,.05)] sm:p-6">
          {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}
          {showIncomplete && !errorMessage && (
            <div className="rounded-lg bg-yellow-100 p-2 text-sm text-yellow-800">
              プロフィールが未完成です
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium">
                店舗名（表示名）<span className="ml-1 text-red-500">*</span>
              </label>
              <Input
                name="store_name"
                value={profile.store_name}
                onChange={(event) => {
                  handleChange(event)
                  if (errors.store_name) setErrors((current) => ({ ...current, store_name: undefined }))
                }}
                aria-invalid={Boolean(errors.store_name)}
                autoComplete="organization"
                className="rounded-lg border border-slate-300 bg-white focus-visible:border-orange-300 focus-visible:ring-2 focus-visible:ring-orange-100"
                placeholder="例：パチンコ○○神戸店"
                required
              />
              {errors.store_name && <p className="text-sm text-red-500">{errors.store_name}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-[180px_minmax(0,1fr)]">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium">
                  都道府県<span className="ml-1 text-red-500">*</span>
                </label>
                <select
                  name="store_prefect"
                  value={profile.store_prefect}
                  onChange={(event) => {
                    handleChange(event)
                    if (errors.store_prefect) setErrors((current) => ({ ...current, store_prefect: undefined }))
                  }}
                  aria-invalid={Boolean(errors.store_prefect)}
                  autoComplete="address-level1"
                  className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
                  required
                >
                  <option value="">選択してください</option>
                  {PREFECTURES.map((prefecture) => (
                    <option key={prefecture} value={prefecture}>{prefecture}</option>
                  ))}
                </select>
                {errors.store_prefect && <p className="text-sm text-red-500">{errors.store_prefect}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium">
                  住所<span className="ml-1 text-red-500">*</span>
                </label>
                <Input
                  name="store_address"
                  value={profile.store_address}
                  onChange={(event) => {
                    handleChange(event)
                    if (errors.store_address) setErrors((current) => ({ ...current, store_address: undefined }))
                  }}
                  aria-invalid={Boolean(errors.store_address)}
                  autoComplete="street-address"
                  className="rounded-lg border border-slate-300 bg-white focus-visible:border-orange-300 focus-visible:ring-2 focus-visible:ring-orange-100"
                  placeholder="例：神戸市中央区相生町4-1-1 ○○ビル1F"
                  required
                />
                <p className="text-xs leading-5 text-slate-500">
                  市区町村・番地まで入力してください。建物名がある場合は建物名も入力してください。
                </p>
                {errors.store_address && <p className="text-sm text-red-500">{errors.store_address}</p>}
              </div>
            </div>

            {!showIncomplete && (
              <>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium">
                    自己紹介 <span className="text-xs font-normal text-slate-400">（任意）</span>
                  </label>
                  <Textarea
                    name="bio"
                    value={profile.bio}
                    onChange={handleChange}
                    rows={4}
                    className="rounded-lg border border-slate-300 bg-white focus-visible:border-orange-300 focus-visible:ring-2 focus-visible:ring-orange-100"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium">
                    店舗画像 <span className="text-xs font-normal text-slate-400">（任意）</span>
                  </label>
                  {avatarPreview && (
                    <img
                      src={avatarPreview}
                      alt="店舗画像プレビュー"
                      className="mb-2 h-24 w-24 rounded-lg object-cover"
                    />
                  )}
                  <Input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleAvatar}
                    className="rounded-lg border border-slate-300 bg-white focus-visible:border-orange-300 focus-visible:ring-2 focus-visible:ring-orange-100"
                  />
                  <p className="text-sm text-gray-500">5MBまで／対応：PNG・JPG・WEBP</p>
                  {errors.avatar && <p className="text-sm text-red-500">{errors.avatar}</p>}
                </div>
              </>
            )}

            <Button
              onClick={handleSave}
              className="mt-4 min-h-11 w-full rounded-xl bg-[#FF5A1F] font-bold text-white hover:bg-[#E94F18]"
              disabled={saving}
            >
              {saving ? '保存中...' : '保存する'}
            </Button>
          </div>
        </section>
      </div>
    </main>
  )
}
