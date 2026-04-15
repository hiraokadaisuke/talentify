'use client'


import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { isProfileComplete } from '@/utils/isProfileComplete'
import { s, n, j } from '@/utils/nullSafe'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

const prefectures = [
  '北海道','青森県','岩手県','宮城県','秋田県','山形県','福島県','茨城県','栃木県','群馬県','埼玉県','千葉県','東京都','神奈川県','新潟県','富山県','石川県','福井県','山梨県','長野県','岐阜県','静岡県','愛知県','三重県','滋賀県','京都府','大阪府','兵庫県','奈良県','和歌山県','鳥取県','島根県','岡山県','広島県','山口県','徳島県','香川県','愛媛県','高知県','福岡県','佐賀県','長崎県','熊本県','大分県','宮崎県','鹿児島県','沖縄県'
]

const GENRE_OPTIONS = ['ライター','アイドル','コスプレ','モデル','その他']
const minHourOptions = ['1時間','2時間','3時間以上']

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp'] as const
const MAX_FILE_SIZE = 5 * 1024 * 1024
const AVATAR_BUCKET = 'talent-photos'

const supabase = createClient()

export default function TalentProfileEditPageClient({ code }: { code?: string | null } = {}) {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [isNew, setIsNew] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [showIncomplete, setShowIncomplete] = useState(false)
  const [profile, setProfile] = useState({
    name: '',
    stage_name: '',
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
    youtubeUrl: ''
  })
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [photoFiles, setPhotoFiles] = useState<File[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
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
    if (!s(p.stage_name).trim()) err.stage_name = 'ステージ名は必須です'
    if (!s(p.genre).trim()) err.genre = 'ジャンルは必須です'
    if (p.area.length === 0) err.area = 'エリアは1つ以上選択してください'
    if (n(p.rate) <= 0) err.rate = '報酬は0より大きい数値を入力してください'
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

  useEffect(() => {
    const loadProfile = async () => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()
      if (authError || !user) {
        console.error('ユーザー取得失敗:', authError)
        setLoading(false)
        return
      }
      setUserId(user.id)

      const fields =
        'name,stage_name,bio,profile,residence,area,genre,availability,min_hours,transportation,rate,notes,achievements:media_appearance,video_url,avatar_url,photos,twitterUrl:twitter_url,instagramUrl:instagram_url,youtubeUrl:youtube_url,is_profile_complete' as const

      const { data, error } = await supabase
        .from('talents' as any)
        .select(fields)
        .eq('user_id', user.id)
        .maybeSingle<any>()

      if (error) {
        console.error('プロフィールの取得に失敗:', error)
        setErrorMessage('プロフィールの取得に失敗しました')
      }

      if (data) {
        setProfile({
          name: s((data as any).name),
          stage_name: s((data as any).stage_name),
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
          twitterUrl: s((data as any).twitterUrl),
          instagramUrl: s((data as any).instagramUrl),
          youtubeUrl: s((data as any).youtubeUrl),
        })
        setIsNew(false)
        setShowIncomplete(!isProfileComplete(data))
      } else {
        setIsNew(true)
        setShowIncomplete(true)
      }
      setLoading(false)
    }

    loadProfile()
  }, [])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    const updated = { ...profile, [name]: value }
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
        await supabase
          .from('talents' as any)
          .update({ avatar_url: avatarUrl })
          .eq('user_id', userId);
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
        name: profile.name,
        stage_name: profile.stage_name,
        ...(profile.bio && { bio: profile.bio }),
        ...(profile.profile && { profile: profile.profile }),
        ...(profile.residence && { residence: profile.residence }),
        ...(profile.area.length > 0 && { area: profile.area }),
        ...(profile.genre && { genre: profile.genre }),
        ...(profile.availability && { availability: profile.availability }),
        ...(profile.min_hours && { min_hours: profile.min_hours }),
        ...(profile.transportation && { transportation: profile.transportation }),
        ...(profile.rate !== '' && { rate: n(profile.rate) }),
        ...(profile.notes && { notes: profile.notes }),
        ...(profile.achievements && { media_appearance: profile.achievements }),
        ...(profile.video_url && { video_url: profile.video_url }),
        ...(photoUrls.length > 0 && { photos: photoUrls }),
        ...(profile.twitterUrl && { twitter_url: profile.twitterUrl }),
        ...(profile.instagramUrl && { instagram_url: profile.instagramUrl }),
        ...(profile.youtubeUrl && { youtube_url: profile.youtubeUrl }),
        is_setup_complete: true,
        is_profile_complete: isComplete,
      }

      console.log('📝 updateData:', updateData)

      const { error } = await supabase
        .from('talents' as any)
        .update(updateData)
        .eq('user_id', user.id)

      if (error) throw error

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

  const fieldClassName = 'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500'
  const sectionClassName = 'space-y-4'

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-3xl">
        <header className="mb-6 sm:mb-8">
          <h1 className="text-3xl font-bold tracking-tight">演者プロフィール編集</h1>
          <p className="mt-2 text-sm text-gray-600">
            プロフィールを充実させると、案件掲載時に見つけてもらいやすくなります。
          </p>
        </header>

        <section className="space-y-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:space-y-8 sm:p-8">
          {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}

          {showIncomplete && !errorMessage && (
            <div className="rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-900">
              <p className="font-medium">プロフィールが未完成です</p>
              <p className="mt-1 text-yellow-800">公開条件の必須項目を入力すると、プロフィールを公開できます。</p>
            </div>
          )}

          <section className="rounded-xl border border-gray-200 bg-gray-50 p-4 sm:p-5">
            <h2 className="mb-3 text-base font-semibold text-gray-900">公開の最低条件（MVP）</h2>
            <ul className="space-y-2 text-sm text-gray-700">
              {[
                { key: 'stage_name', label: 'ステージ名', done: requirements.stage_name },
                { key: 'genre', label: 'ジャンル', done: requirements.genre },
                { key: 'area', label: 'エリア', done: requirements.area },
                { key: 'rate', label: '報酬', done: requirements.rate },
                { key: 'bioOrProfile', label: '自己紹介またはプロフィール（20文字以上）', done: requirements.bioOrProfile },
                { key: 'avatar', label: 'プロフィール画像', done: requirements.avatar },
              ].map((item) => (
                <li key={item.key} className="flex items-center gap-3 rounded-lg bg-white px-3 py-2">
                  <span
                    className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-semibold ${
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
            <h2 className="text-xl font-semibold">基本情報</h2>

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
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-800">芸名<span className="ml-1 text-red-500">*</span></label>
              <Input
                type="text"
                name="stage_name"
                value={profile.stage_name ?? ''}
                onChange={handleChange}
                className={fieldClassName}
                placeholder="例：ハナコ"
              />
              {errors.stage_name && <p className="text-sm text-red-500">{errors.stage_name}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-800">自己紹介（bio）<span className="ml-1 text-red-500">*</span></label>
              <p className="text-sm text-gray-500">
                自己紹介（bio）とプロフィール詳細のどちらか一方を20文字以上入力してください。
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
                  <span key={idx} className="flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700">
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
            <h2 className="text-xl font-semibold">出演条件</h2>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-800">出演可能時間帯</label>
              <Input
                type="text"
                name="availability"
                value={profile.availability ?? ''}
                onChange={handleChange}
                className={fieldClassName}
                placeholder="例: 10:00〜18:00"
              />
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
              <Input
                type="number"
                name="rate"
                value={profile.rate ?? ''}
                onChange={handleChange}
                className={fieldClassName}
                placeholder="例：5000"
              />
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
              />
            </div>
          </section>

          <section className={sectionClassName}>
            <h2 className="text-xl font-semibold">実績・PR</h2>
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
            <h2 className="text-xl font-semibold">SNSリンク</h2>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-800">X (旧Twitter)<span className="ml-1 text-xs text-gray-500">(任意)</span></label>
              <Input
                type="url"
                name="twitterUrl"
                value={profile.twitterUrl ?? ''}
                onChange={handleChange}
                className={fieldClassName}
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-800">Instagram<span className="ml-1 text-xs text-gray-500">(任意)</span></label>
              <Input
                type="url"
                name="instagramUrl"
                value={profile.instagramUrl ?? ''}
                onChange={handleChange}
                className={fieldClassName}
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-800">YouTube<span className="ml-1 text-xs text-gray-500">(任意)</span></label>
              <Input
                type="url"
                name="youtubeUrl"
                value={profile.youtubeUrl ?? ''}
                onChange={handleChange}
                className={fieldClassName}
              />
            </div>
          </section>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="mt-2 h-11 w-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? '保存中...' : '保存する'}
          </Button>
        </section>
      </div>
    </main>
  )
}
