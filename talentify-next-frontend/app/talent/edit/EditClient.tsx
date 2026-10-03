'use client'


import { useCallback, useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { isProfileComplete } from '@/utils/isProfileComplete'
import { s, n, j } from '@/utils/nullSafe'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { AlertCircle, RotateCcw } from 'lucide-react'

const prefectures = [
  '北海道','青森県','岩手県','宮城県','秋田県','山形県','福島県','茨城県','栃木県','群馬県','埼玉県','千葉県','東京都','神奈川県','新潟県','富山県','石川県','福井県','山梨県','長野県','岐阜県','静岡県','愛知県','三重県','滋賀県','京都府','大阪府','兵庫県','奈良県','和歌山県','鳥取県','島根県','岡山県','広島県','山口県','徳島県','香川県','愛媛県','高知県','福岡県','佐賀県','長崎県','熊本県','大分県','宮崎県','鹿児島県','沖縄県'
]

const GENRE_OPTIONS = ['パチンコ・パチスロ演者','ライター','タレント','インフルエンサー','配信者','アイドル','モデル','コスプレイヤー','その他']
const minHourOptions = ['1時間','2時間','3時間以上']
const TIME_OPTIONS = Array.from({ length: 18 }, (_, i) => {
  const hour = i + 6
  return `${String(hour).padStart(2, '0')}:00`
})

function splitTimeRange(value?: string | null) {
  const normalized = String(value ?? '').trim()
  if (!normalized) return { start: '', end: '' }

  const fullMatch = normalized.match(/^(\d{2}:\d{2})\s*[〜~-]\s*(\d{2}:\d{2})$/)
  if (fullMatch) {
    return { start: fullMatch[1], end: fullMatch[2] }
  }

  const partialMatch = normalized.match(/^(\d{2}:\d{2})?\s*〜\s*(\d{2}:\d{2})?$/)
  return {
    start: partialMatch?.[1] ?? '',
    end: partialMatch?.[2] ?? '',
  }
}

function joinTimeRange(start: string, end: string) {
  if (!start && !end) return ''
  return `${start}〜${end}`
}

type SocialKey = 'twitterUrl' | 'instagramUrl' | 'youtubeUrl' | 'tiktokUrl'
type SocialPlatform = 'x' | 'instagram' | 'youtube' | 'tiktok'

const SOCIAL_PLATFORMS: Array<{
  key: SocialKey
  platform: SocialPlatform
  label: string
  badge: string
  placeholder: string
  help: string
}> = [
  {
    key: 'twitterUrl',
    platform: 'x',
    label: 'X',
    badge: 'X',
    placeholder: '@username またはプロフィールURL',
    help: '@ユーザー名だけでも登録できます。',
  },
  {
    key: 'instagramUrl',
    platform: 'instagram',
    label: 'Instagram',
    badge: 'IG',
    placeholder: '@username またはプロフィールURL',
    help: '@ユーザー名だけでも登録できます。',
  },
  {
    key: 'youtubeUrl',
    platform: 'youtube',
    label: 'YouTube',
    badge: 'YT',
    placeholder: '@handle またはチャンネルURL',
    help: 'YouTubeの@ハンドル、またはチャンネルURLを入力できます。',
  },
  {
    key: 'tiktokUrl',
    platform: 'tiktok',
    label: 'TikTok',
    badge: 'TT',
    placeholder: '@username またはプロフィールURL',
    help: '@ユーザー名だけでも登録できます。',
  },
]

function socialInputFromStored(platform: SocialPlatform, value?: string | null) {
  const raw = String(value ?? '').trim()
  if (!raw) return ''

  try {
    const url = new URL(raw)
    const parts = url.pathname.split('/').filter(Boolean)
    if (platform === 'youtube') {
      const handle = parts.find(part => part.startsWith('@'))
      return handle || raw
    }
    const candidate = parts[0]
    return candidate ? `@${candidate.replace(/^@/, '')}` : raw
  } catch {
    return raw
  }
}

function normalizeSocialUrl(platform: SocialPlatform, value?: string | null) {
  const raw = String(value ?? '').trim()
  if (!raw) return null

  if (/^https?:\/\//i.test(raw)) return raw

  const handle = raw.replace(/^@/, '').replace(/^\/+|\/+$/g, '')
  if (!handle) return null

  switch (platform) {
    case 'x':
      return `https://x.com/${handle}`
    case 'instagram':
      return `https://www.instagram.com/${handle}/`
    case 'youtube':
      return `https://www.youtube.com/@${handle}`
    case 'tiktok':
      return `https://www.tiktok.com/@${handle}`
  }
}

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp'] as const
const MAX_FILE_SIZE = 5 * 1024 * 1024
const AVATAR_BUCKET = 'talent-photos'

const supabase = createClient()

export default function TalentProfileEditPageClient({ code }: { code?: string | null } = {}) {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [isNew, setIsNew] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [showIncomplete, setShowIncomplete] = useState(false)
  const [profile, setProfile] = useState({
    name: '',
    stage_name: '',
    phone: '',
    preferred_contact_method: 'chat',
    phone_contact_allowed: false,
    phone_available_hours: '',
    bio: '',
    profile: '',
    residence: '',
    area: [] as string[],
    genre: '',
    availability: '',
    min_hours: '',
    transportation: '込み',
    rate: '',
    notes: '',
    achievements: '',
    video_url: '',
    avatar_url: '',
    photos: [] as string[],
    twitterUrl: '',
    instagramUrl: '',
    youtubeUrl: '',
    tiktokUrl: ''
  })
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [photoFiles, setPhotoFiles] = useState<File[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [enabledSocials, setEnabledSocials] = useState<SocialKey[]>([])
  const [socialPickerOpen, setSocialPickerOpen] = useState(false)
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

  const uploadImage = async (file: File, user: string, kind: 'avatar' | 'photo') => {
    const { type, ext } = getMimeAndExt(file)
    const path = `avatars/${user}/${kind}-${Date.now()}.${ext}`
    const { error: upErr } = await supabase.storage
      .from(AVATAR_BUCKET)
      .upload(path, file, { upsert: true, contentType: type, cacheControl: '3600' })
    if (upErr) throw upErr
    const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path)
    return data.publicUrl
  }

  const validate = (p: typeof profile) => {
    const err: Record<string, string> = {}
    if (!s(p.name).trim()) err.name = '本名は必須です'
    if (!s(p.stage_name).trim()) err.stage_name = '公開名は必須です'
    const normalizedPhone = s(p.phone).replace(/\D/g, '')
    if (p.phone && !/^\d{10,11}$/.test(normalizedPhone)) err.phone = '電話番号は10〜11桁で入力してください'
    if (p.phone_contact_allowed && !normalizedPhone) err.phone = '電話対応を許可するには電話番号が必要です'
    if (!s(p.genre).trim()) err.genre = 'ジャンルは必須です'
    if (p.area.length === 0) err.area = 'エリアは1つ以上選択してください'
    if (n(p.rate) <= 0) err.rate = '報酬は0より大きい数値を入力してください'

    const availabilityRange = splitTimeRange(p.availability)
    if ((availabilityRange.start && !availabilityRange.end) || (!availabilityRange.start && availabilityRange.end)) {
      err.availability = '開始時間と終了時間を両方選択してください'
    }
    if (availabilityRange.start && availabilityRange.end && availabilityRange.start >= availabilityRange.end) {
      err.availability = '終了時間は開始時間より後を選択してください'
    }

    const phoneRange = splitTimeRange(p.phone_available_hours)
    if (
      p.phone_contact_allowed &&
      ((phoneRange.start && !phoneRange.end) || (!phoneRange.start && phoneRange.end))
    ) {
      err.phone_available_hours = '開始時間と終了時間を両方選択してください'
    }
    const bioLen = s(p.bio).trim().length
    const profileLen = s(p.profile).trim().length
    if (bioLen < 20 && profileLen < 20) {
      err.bio = '自己紹介またはプロフィールを20文字以上入力してください'
      err.profile = '自己紹介またはプロフィールを20文字以上入力してください'
    }
    if (!s(p.avatar_url).trim() && !avatarFile)
      err.avatar_url = 'プロフィール画像は必須です'
    return err
  }

  const requirements = useMemo(() => {
    return {
      stage_name: s(profile.stage_name).trim().length > 0,
      genre: s(profile.genre).trim().length > 0,
      area: profile.area.length > 0,
      rate: n(profile.rate) > 0,
      bioOrProfile:
        s(profile.bio).trim().length >= 20 ||
        s(profile.profile).trim().length >= 20,
      avatar: s(profile.avatar_url).trim().length > 0 || !!avatarFile,
    }
  }, [profile, avatarFile])

  // プロフィール読み込み

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

      setUserId(user.id)

      const fields =
        'name,stage_name,preferred_contact_method,phone_contact_allowed,phone_available_hours,bio,profile,residence,area,genre,availability,min_hours,transportation,rate,notes,achievements:media_appearance,video_url,avatar_url,photos,twitterUrl:twitter_url,instagramUrl:instagram_url,youtubeUrl:youtube_url,tiktokUrl:social_tiktok,is_profile_complete' as const

      const [{ data, error }, { data: appUser, error: appUserError }] = await Promise.all([
        supabase
          .from('talents' as any)
          .select(fields)
          .eq('user_id', user.id)
          .maybeSingle<any>(),
        supabase
          .from('users')
          .select('phone')
          .eq('auth_user_id', user.id)
          .maybeSingle(),
      ])

      if (error || appUserError) {
        console.error('プロフィールの取得に失敗:', {
          talentError: error,
          userError: appUserError,
        })
        throw error ?? appUserError
      }

      if (data) {
        setProfile({
          name: s((data as any).name),
          stage_name: s((data as any).stage_name),
          phone: s(appUser?.phone),
          preferred_contact_method: s((data as any).preferred_contact_method) || 'chat',
          phone_contact_allowed: Boolean((data as any).phone_contact_allowed),
          phone_available_hours: s((data as any).phone_available_hours),
          bio: s((data as any).bio),
          profile: s((data as any).profile),
          residence: s((data as any).residence),
          area: j<string[]>((data as any).area, []),
          genre: s((data as any).genre),
          availability: s((data as any).availability),
          min_hours: s((data as any).min_hours),
          transportation: s((data as any).transportation) || '込み',
          rate: (data as any).rate != null ? String((data as any).rate) : '',
          notes: s((data as any).notes),
          achievements: s((data as any).achievements),
          video_url: s((data as any).video_url),
          avatar_url: s((data as any).avatar_url),
          photos: j<string[]>((data as any).photos, []),
          twitterUrl: socialInputFromStored('x', s((data as any).twitterUrl)),
          instagramUrl: socialInputFromStored('instagram', s((data as any).instagramUrl)),
          youtubeUrl: socialInputFromStored('youtube', s((data as any).youtubeUrl)),
          tiktokUrl: socialInputFromStored('tiktok', s((data as any).tiktokUrl)),
        })
        setEnabledSocials(
          [
            (data as any).twitterUrl ? 'twitterUrl' : null,
            (data as any).instagramUrl ? 'instagramUrl' : null,
            (data as any).youtubeUrl ? 'youtubeUrl' : null,
            (data as any).tiktokUrl ? 'tiktokUrl' : null,
          ].filter((value): value is SocialKey => Boolean(value))
        )
        setIsNew(false)
        setShowIncomplete(!isProfileComplete(data))
      } else {
        setEnabledSocials([])
        setIsNew(true)
        setShowIncomplete(true)
      }
    } catch (error) {
      console.error('演者プロフィールの読み込みに失敗:', error)
      setUserId(null)
      setLoadError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadProfile()
  }, [loadProfile])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    const updated = { ...profile, [name]: value }
    setProfile(updated)
    setErrors(validate(updated))
  }

  const handleTimeRangeChange = (
    field: 'availability' | 'phone_available_hours',
    part: 'start' | 'end',
    value: string
  ) => {
    const current = splitTimeRange(profile[field])
    const nextStart = part === 'start' ? value : current.start
    const nextEnd = part === 'end' ? value : current.end
    const updated = { ...profile, [field]: joinTimeRange(nextStart, nextEnd) }
    setProfile(updated)
    setErrors(validate(updated))
  }

  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      getMimeAndExt(file)
      setAvatarFile(file)
      setErrors(validate(profile))
    } catch (err: any) {
      toast.error(err.message)
      setErrors({ ...errors, avatar_url: err.message })
      e.target.value = ''
    }
  }

  const handlePhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const files: File[] = []
    for (const f of Array.from(e.target.files)) {
      try {
        getMimeAndExt(f)
        files.push(f)
      } catch (err: any) {
        toast.error(err.message)
      }
    }
    setPhotoFiles(files)
  }

  const handleAddArea = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    if (!value) return
    const updated = { ...profile, area: [...profile.area, value] }
    setProfile(updated)
    setErrors(validate(updated))
    e.target.value = ''
  }

  const removeArea = (index: number) => {
    const newArea = profile.area.filter((_, i) => i !== index)
    const updated = { ...profile, area: newArea }
    setProfile(updated)
    setErrors(validate(updated))
  }

  const moveArea = (from: number, to: number) => {
    if (to < 0 || to >= profile.area.length) return
    const newArea = [...profile.area]
    const [item] = newArea.splice(from, 1)
    newArea.splice(to, 0, item)
    const updated = { ...profile, area: newArea }
    setProfile(updated)
    setErrors(validate(updated))
  }

  const handleSave = async () => {
    if (!userId) return

    const errs = validate(profile)
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    setSaving(true)
    try {
      let avatarUrl = profile.avatar_url
      if (avatarFile) {
        avatarUrl = await uploadImage(avatarFile, userId, 'avatar')
        setProfile((p) => ({ ...p, avatar_url: avatarUrl }))
      }

      let photoUrls: string[] = []
      if (photoFiles.length > 0) {
        for (const f of photoFiles) {
          const url = await uploadImage(f, userId, 'photo')
          photoUrls.push(url)
        }
      }

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()
      if (authError || !user) {
        throw new Error('ユーザー情報の取得に失敗しました')
      }

      const isComplete = isProfileComplete({
        stage_name: profile.stage_name,
        genre: profile.genre,
        area: profile.area,
        rate: n(profile.rate),
        bio: profile.bio,
        profile: profile.profile,
        avatar_url: avatarUrl,
      })

      const updateData = {
        user_id: user.id,
        name: profile.name.trim(),
        stage_name: profile.stage_name,
        preferred_contact_method: profile.preferred_contact_method,
        phone_contact_allowed: profile.phone_contact_allowed,
        phone_available_hours: profile.phone_contact_allowed ? (profile.phone_available_hours || null) : null,
        ...(profile.bio && { bio: profile.bio }),
        ...(profile.profile && { profile: profile.profile }),
        ...(profile.residence && { residence: profile.residence }),
        ...(profile.area.length > 0 && { area: JSON.stringify(profile.area) }),
        ...(profile.genre && { genre: profile.genre }),
        ...(profile.availability && { availability: profile.availability }),
        ...(profile.min_hours && { min_hours: profile.min_hours }),
        ...(profile.transportation && { transportation: profile.transportation }),
        ...(profile.rate !== '' && { rate: n(profile.rate) }),
        ...(profile.notes && { notes: profile.notes }),
        ...(profile.achievements && { media_appearance: profile.achievements }),
        ...(profile.video_url && { video_url: profile.video_url }),
        avatar_url: avatarUrl || null,
        photos: photoUrls.length > 0 ? [...profile.photos, ...photoUrls] : profile.photos,
        twitter_url: normalizeSocialUrl('x', profile.twitterUrl),
        instagram_url: normalizeSocialUrl('instagram', profile.instagramUrl),
        youtube_url: normalizeSocialUrl('youtube', profile.youtubeUrl),
        social_tiktok: normalizeSocialUrl('tiktok', profile.tiktokUrl),
        is_setup_complete: true,
        is_profile_complete: isComplete,
      }

      console.log('📝 updateData:', updateData)

      const { error } = await supabase
        .from('talents' as any)
        .upsert(updateData, { onConflict: 'user_id' })

      if (error) throw error

      const phoneResponse = await fetch('/api/account/phone', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: profile.phone.replace(/\D/g, '') }),
      })
      if (!phoneResponse.ok) {
        const payload = await phoneResponse.json().catch(() => null)
        throw new Error(payload?.error ?? '電話番号の保存に失敗しました')
      }

      toast.success('保存しました')
      setShowIncomplete(!isComplete)
      if (isNew) {
        router.push('/talent/edit/complete')
      } else {
        router.push('/talent/dashboard?saved=1')
      }
    } catch (err: any) {
      console.error('talents の保存に失敗:', err)
      setErrorMessage(err.message || '保存に失敗しました')
      toast.error(err.message || '保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="p-4">読み込み中...</p>

  if (loadError) {
    return (
      <main className="min-h-screen bg-gray-100 px-4 py-8 sm:px-6 sm:py-10">
        <div className="mx-auto w-full max-w-3xl">
          <h1 className="mb-6 text-3xl font-bold tracking-tight">演者プロフィール編集</h1>
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

  const fieldClassName = 'min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:border-orange-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-100'
  const sectionClassName = 'space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,.05)] sm:p-5'

  return (
    <main className="py-2 sm:py-4">
      <div className="mx-auto w-full max-w-3xl">
        <header className="mb-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,.05)]">
          <div className="p-5 sm:p-6">
            <p className="text-[11px] font-black tracking-[0.16em] text-[#C2410C]">TALENT PROFILE</p>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">演者プロフィール編集</h1>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              店舗から見つけてもらうための公開情報と、連絡に必要な情報を管理します。
            </p>
          </div>
          <div className="h-1 bg-gradient-to-r from-[#FF3B2E] via-[#FF8A00] to-[#FFC400]" />
        </header>

        <section className="space-y-4 pb-4 sm:space-y-6">
          {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}

          {showIncomplete && !errorMessage && (
            <div className="rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-900">
              <p className="font-medium">プロフィールが未完成です</p>
              <p className="mt-1 text-yellow-800">公開条件の必須項目を入力すると、プロフィールを公開できます。</p>
            </div>
          )}

          <section className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 sm:p-5">
            <h2 className="mb-1 text-base font-bold text-slate-900">公開に必要な項目</h2>
            <p className="mb-3 text-xs leading-5 text-slate-600">すべて入力するとプロフィールが公開状態になります。</p>
            <ul className="flex flex-wrap gap-2 text-xs text-slate-700">
              {[
                { key: 'stage_name', label: '公開名', done: requirements.stage_name },
                { key: 'genre', label: 'ジャンル', done: requirements.genre },
                { key: 'area', label: 'エリア', done: requirements.area },
                { key: 'rate', label: '報酬', done: requirements.rate },
                { key: 'bioOrProfile', label: '紹介文20文字以上', done: requirements.bioOrProfile },
                { key: 'avatar', label: 'プロフィール画像', done: requirements.avatar },
              ].map((item) => (
                <li
                  key={item.key}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 font-medium ${
                    item.done
                      ? 'border-emerald-200 bg-white text-emerald-800'
                      : 'border-rose-200 bg-rose-50 text-rose-700'
                  }`}
                >
                  <span
                    className={`inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${
                      item.done
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-rose-100 text-rose-700'
                    }`}
                    aria-hidden
                  >
                    {item.done ? '✓' : '×'}
                  </span>
                  <span>{item.label}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className={sectionClassName}>
            <h2 className="text-lg font-bold text-slate-950">基本情報</h2>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-800">本名<span className="ml-1 text-red-500">*</span></label>
              <Input
                type="text"
                name="name"
                value={profile.name ?? ''}
                onChange={handleChange}
                className={fieldClassName}
                placeholder="例：山田花子"
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-800">公開名（サイト内表示名）<span className="ml-1 text-red-500">*</span></label>
              <p className="text-sm leading-5 text-gray-500">
                来店ナビ内のプロフィールや店舗向け画面に表示される名称です。芸名・活動名・本名など、公開したい名称を入力してください。
              </p>
              <Input
                type="text"
                name="stage_name"
                value={profile.stage_name ?? ''}
                onChange={handleChange}
                className={fieldClassName}
                placeholder="例：きいち"
                autoComplete="nickname"
              />
              {errors.stage_name && <p className="text-sm text-red-500">{errors.stage_name}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-800">自己紹介<span className="ml-1 text-red-500">*</span></label>
              <p className="text-sm text-gray-500">
                自己紹介とプロフィール詳細のどちらか一方を20文字以上入力してください。
              </p>
              <Textarea
                name="bio"
                maxLength={300}
                value={profile.bio ?? ''}
                onChange={handleChange}
                className={fieldClassName}
                rows={4}
                placeholder="例：イベント出演経験があります..."
              />
              {errors.bio && <p className="text-sm text-red-500">{errors.bio}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-800">プロフィール詳細<span className="ml-1 text-red-500">*</span></label>
              <Textarea
                name="profile"
                maxLength={500}
                value={profile.profile ?? ''}
                onChange={handleChange}
                className={fieldClassName}
                rows={4}
                placeholder="経歴や活動内容などを詳しく書いてください"
              />
              {errors.profile && <p className="text-sm text-red-500">{errors.profile}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-800">拠点地域</label>
              <select
                name="residence"
                value={profile.residence ?? ''}
                onChange={handleChange}
                className={fieldClassName}
              >
                <option value="">選択してください</option>
                {prefectures.map(p => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-800">対応エリア<span className="ml-1 text-red-500">*</span></label>
              <div className="flex flex-wrap gap-2">
                {profile.area.map((a, idx) => (
                  <span key={idx} className="flex items-center rounded-full bg-orange-50 px-3 py-1 text-sm font-medium text-[#C2410C]">
                    {a}
                    <button type="button" onClick={() => removeArea(idx)} className="ml-2 text-red-500">×</button>
                    <button type="button" onClick={() => moveArea(idx, idx - 1)} className="ml-1 text-xs text-gray-600">↑</button>
                    <button type="button" onClick={() => moveArea(idx, idx + 1)} className="ml-1 text-xs text-gray-600">↓</button>
                  </span>
                ))}
              </div>
              <select onChange={handleAddArea} className={fieldClassName}>
                <option value="">エリアを追加</option>
                {prefectures
                  .filter(p => !profile.area.includes(p))
                  .map(p => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
              </select>
              {errors.area && <p className="text-sm text-red-500">{errors.area}</p>}
              <p className="text-sm text-gray-500">例：関東一円／東海 など</p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-800">ジャンル<span className="ml-1 text-red-500">*</span></label>
              <select
                name="genre"
                value={profile.genre ?? ''}
                onChange={handleChange}
                className={fieldClassName}
              >
                <option value="">選択してください</option>
                {GENRE_OPTIONS.map(g => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
              {errors.genre && <p className="text-sm text-red-500">{errors.genre}</p>}
            </div>
          </section>

          <section className={sectionClassName}>
            <h2 className="text-lg font-bold text-slate-950">連絡方法</h2>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-800">登録電話番号</label>
              <Input
                type="tel"
                inputMode="tel"
                name="phone"
                value={profile.phone}
                onChange={handleChange}
                className={fieldClassName}
                placeholder="例：09012345678"
              />
              <p className="text-sm text-gray-500">登録時の電話番号です。変更もできます。電話対応を許可した案件でのみホール側に表示します。</p>
              {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-800">案件での連絡方法</label>
              <label className="flex items-start gap-3 rounded-lg border border-gray-200 p-3">
                <input
                  type="radio"
                  name="contactOption"
                  checked={profile.preferred_contact_method === 'chat' && profile.phone_contact_allowed}
                  onChange={() => setProfile(p => ({ ...p, preferred_contact_method: 'chat', phone_contact_allowed: true }))}
                  className="mt-1"
                />
                <span><span className="block text-sm font-medium">チャット推奨（必要なら電話も可）</span><span className="text-xs text-gray-500">まず来店ナビ内で相談し、必要な場合は電話連絡も受け付けます。</span></span>
              </label>
              <label className="flex items-start gap-3 rounded-lg border border-gray-200 p-3">
                <input
                  type="radio"
                  name="contactOption"
                  checked={profile.preferred_contact_method === 'phone' && profile.phone_contact_allowed}
                  onChange={() => setProfile(p => ({ ...p, preferred_contact_method: 'phone', phone_contact_allowed: true }))}
                  className="mt-1"
                />
                <span><span className="block text-sm font-medium">電話対応可</span><span className="text-xs text-gray-500">案件成立前の条件相談で電話連絡を歓迎します。</span></span>
              </label>
              <label className="flex items-start gap-3 rounded-lg border border-gray-200 p-3">
                <input
                  type="radio"
                  name="contactOption"
                  checked={!profile.phone_contact_allowed}
                  onChange={() => setProfile(p => ({ ...p, preferred_contact_method: 'chat', phone_contact_allowed: false, phone_available_hours: '' }))}
                  className="mt-1"
                />
                <span><span className="block text-sm font-medium">電話対応不可（チャットのみ）</span><span className="text-xs text-gray-500">電話番号はホールに表示されません。</span></span>
              </label>
            </div>
            {profile.phone_contact_allowed && (
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-800">電話可能時間帯</label>
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                  <select
                    value={splitTimeRange(profile.phone_available_hours).start}
                    onChange={e => handleTimeRangeChange('phone_available_hours', 'start', e.target.value)}
                    className={fieldClassName}
                  >
                    <option value="">開始</option>
                    {TIME_OPTIONS.map(time => (
                      <option key={`phone-start-${time}`} value={time}>{time}</option>
                    ))}
                  </select>
                  <span className="text-sm font-bold text-slate-400">〜</span>
                  <select
                    value={splitTimeRange(profile.phone_available_hours).end}
                    onChange={e => handleTimeRangeChange('phone_available_hours', 'end', e.target.value)}
                    className={fieldClassName}
                  >
                    <option value="">終了</option>
                    {TIME_OPTIONS
                      .filter(time => !splitTimeRange(profile.phone_available_hours).start || time > splitTimeRange(profile.phone_available_hours).start)
                      .map(time => (
                        <option key={`phone-end-${time}`} value={time}>{time}</option>
                      ))}
                  </select>
                </div>
                <p className="text-xs text-slate-500">電話対応できるおおよその時間帯を設定します。</p>
                {errors.phone_available_hours && (
                  <p className="text-sm text-red-500">{errors.phone_available_hours}</p>
                )}
              </div>
            )}
          </section>

          <section className={sectionClassName}>
            <h2 className="text-lg font-bold text-slate-950">出演条件</h2>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-800">出演可能時間帯</label>
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                <select
                  value={splitTimeRange(profile.availability).start}
                  onChange={e => handleTimeRangeChange('availability', 'start', e.target.value)}
                  className={fieldClassName}
                >
                  <option value="">開始</option>
                  {TIME_OPTIONS.map(time => (
                    <option key={`availability-start-${time}`} value={time}>{time}</option>
                  ))}
                </select>
                <span className="text-sm font-bold text-slate-400">〜</span>
                <select
                  value={splitTimeRange(profile.availability).end}
                  onChange={e => handleTimeRangeChange('availability', 'end', e.target.value)}
                  className={fieldClassName}
                >
                  <option value="">終了</option>
                  {TIME_OPTIONS
                    .filter(time => !splitTimeRange(profile.availability).start || time > splitTimeRange(profile.availability).start)
                    .map(time => (
                      <option key={`availability-end-${time}`} value={time}>{time}</option>
                    ))}
                </select>
              </div>
              <p className="text-xs leading-5 text-slate-500">
                通常の出演目安です。実際の希望時間はオファーごとに調整できます。
              </p>
              {errors.availability && <p className="text-sm text-red-500">{errors.availability}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-800">最低拘束時間</label>
              <select
                name="min_hours"
                value={profile.min_hours ?? ''}
                onChange={handleChange}
                className={fieldClassName}
              >
                <option value="">選択してください</option>
                {minHourOptions.map(o => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-800">交通費扱い</label>
              <div className="flex items-center gap-6 rounded-lg border border-gray-200 px-3 py-2">
                <label className="text-sm text-gray-700">
                  <input
                    type="radio"
                    name="transportation"
                    value="込み"
                    checked={profile.transportation === '込み'}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  込み
                </label>
                <label className="text-sm text-gray-700">
                  <input
                    type="radio"
                    name="transportation"
                    value="別途"
                    checked={profile.transportation === '別途'}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  別途
                </label>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-800">出演料金目安<span className="ml-1 text-red-500">*</span></label>
              <div className="relative">
                <Input
                  type="number"
                  inputMode="numeric"
                  min="0"
                  step="1000"
                  name="rate"
                  value={profile.rate ?? ''}
                  onChange={handleChange}
                  className={`${fieldClassName} pr-10`}
                  placeholder="例：30000"
                />
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm font-medium text-slate-500">円</span>
              </div>
              {errors.rate && <p className="text-sm text-red-500">{errors.rate}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-800">NG事項・特記事項<span className="ml-1 text-xs text-gray-500">(任意)</span></label>
              <Textarea
                name="notes"
                value={profile.notes ?? ''}
                onChange={handleChange}
                className={fieldClassName}
                rows={3}
                placeholder="例：写真撮影不可、終了時刻厳守など"
              />
            </div>
          </section>

          <section className={sectionClassName}>
            <h2 className="text-lg font-bold text-slate-950">実績・PR</h2>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-800">来店実績<span className="ml-1 text-xs text-gray-500">(任意)</span></label>
              <Textarea
                name="achievements"
                value={profile.achievements ?? ''}
                onChange={handleChange}
                className={fieldClassName}
                rows={3}
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-800">動画URL<span className="ml-1 text-xs text-gray-500">(任意)</span></label>
              <Input
                type="url"
                name="video_url"
                value={profile.video_url ?? ''}
                onChange={handleChange}
                className={fieldClassName}
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-800">プロフィール画像<span className="ml-1 text-red-500">*</span></label>
              <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4">
                {avatarPreview && (
                  <img
                    src={avatarPreview}
                    alt="avatar preview"
                    className="mb-3 h-24 w-24 rounded-lg object-cover"
                  />
                )}
                <Input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleAvatar}
                  className={fieldClassName}
                />
                <p className="mt-2 text-sm text-gray-500">5MBまで／対応：PNG・JPG・WEBP</p>
                {errors.avatar_url && <p className="mt-1 text-sm text-red-500">{errors.avatar_url}</p>}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-800">写真追加</label>
              <Input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                multiple
                onChange={handlePhotos}
                className={fieldClassName}
              />
            </div>
          </section>

          <section className={sectionClassName}>
            <div>
              <h2 className="text-lg font-bold text-slate-950">SNSアカウント</h2>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                店舗が活動内容を確認するために表示します。URLが分からなくても、@ユーザー名だけで登録できます。
              </p>
            </div>

            {enabledSocials.length > 0 && (
              <div className="space-y-2">
                {enabledSocials.map(key => {
                  const social = SOCIAL_PLATFORMS.find(item => item.key === key)
                  if (!social) return null
                  return (
                    <div key={social.key} className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="grid h-8 min-w-8 place-items-center rounded-lg bg-[#0B1F3B] px-1.5 text-[10px] font-black text-white">
                            {social.badge}
                          </span>
                          <span className="text-sm font-bold text-slate-900">{social.label}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setProfile(current => ({ ...current, [social.key]: '' }))
                            setEnabledSocials(current => current.filter(item => item !== social.key))
                          }}
                          className="text-xs font-semibold text-slate-400 hover:text-red-600"
                        >
                          削除
                        </button>
                      </div>
                      <Input
                        type="text"
                        value={profile[social.key] ?? ''}
                        onChange={e =>
                          setProfile(current => ({ ...current, [social.key]: e.target.value }))
                        }
                        className={fieldClassName}
                        placeholder={social.placeholder}
                        autoCapitalize="none"
                        autoCorrect="off"
                      />
                      <p className="mt-1.5 text-[11px] leading-4 text-slate-500">{social.help}</p>
                    </div>
                  )
                })}
              </div>
            )}

            <div>
              <Button
                type="button"
                variant="outline"
                className="w-full rounded-xl border-dashed border-slate-300 bg-white font-bold text-slate-700"
                onClick={() => setSocialPickerOpen(current => !current)}
              >
                ＋ SNSアカウントを追加
              </Button>

              {socialPickerOpen && (
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {SOCIAL_PLATFORMS.filter(social => !enabledSocials.includes(social.key)).map(social => (
                    <button
                      key={social.key}
                      type="button"
                      onClick={() => {
                        setEnabledSocials(current => [...current, social.key])
                        setSocialPickerOpen(false)
                      }}
                      className="flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-left text-sm font-bold text-slate-800 transition hover:border-orange-200 hover:bg-orange-50"
                    >
                      <span className="grid h-7 min-w-7 place-items-center rounded-lg bg-[#0B1F3B] px-1 text-[9px] font-black text-white">
                        {social.badge}
                      </span>
                      {social.label}
                    </button>
                  ))}
                  {SOCIAL_PLATFORMS.every(social => enabledSocials.includes(social.key)) && (
                    <p className="col-span-2 py-2 text-center text-xs text-slate-500">
                      追加できるSNSはすべて登録されています。
                    </p>
                  )}
                </div>
              )}
            </div>

            <p className="text-[11px] leading-5 text-slate-500">
              登録したSNSは店舗側のプロフィールから直接開けます。フォロワー数の入力や連携設定は不要です。
            </p>
          </section>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="sticky bottom-[calc(0.5rem+env(safe-area-inset-bottom))] z-20 mt-2 h-12 w-full rounded-xl bg-[#FF5A1F] text-base font-bold text-white shadow-lg shadow-orange-900/10 hover:bg-[#E94F18] disabled:opacity-50 sm:static sm:h-11 sm:text-sm sm:shadow-none"
          >
            {saving ? '保存中...' : '保存する'}
          </Button>
        </section>
      </div>
    </main>
  )
}
