'use client'


import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { isProfileComplete } from '@/utils/isProfileComplete'

const prefectures = [
  '北海道','青森県','岩手県','宮城県','秋田県','山形県','福島県','茨城県','栃木県','群馬県','埼玉県','千葉県','東京都','神奈川県','新潟県','富山県','石川県','福井県','山梨県','長野県','岐阜県','静岡県','愛知県','三重県','滋賀県','京都府','大阪府','兵庫県','奈良県','和歌山県','鳥取県','島根県','岡山県','広島県','山口県','徳島県','香川県','愛媛県','高知県','福岡県','佐賀県','長崎県','熊本県','大分県','宮崎県','鹿児島県','沖縄県'
]

const GENRE_OPTIONS = ['ライター','アイドル','コスプレ','モデル','その他']
const minHourOptions = ['1時間','2時間','3時間以上']

const supabase = createClient()

export default function TalentProfileEditPageClient({ code }: { code?: string | null }) {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [isNew, setIsNew] = useState(false)
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
  const avatarPreview = useMemo(
    () => (avatarFile ? URL.createObjectURL(avatarFile) : profile.avatar_url),
    [avatarFile, profile.avatar_url]
  )

  const validate = (p: typeof profile) => {
    const err: Record<string, string> = {}
    if (!p.stage_name.trim()) err.stage_name = 'ステージ名は必須です'
    if (!p.genre.trim()) err.genre = 'ジャンルは必須です'
    if (p.area.length === 0) err.area = 'エリアは1つ以上選択してください'
    if (!p.rate || Number(p.rate) <= 0)
      err.rate = '報酬は0より大きい数値を入力してください'
    const bioLen = p.bio.trim().length
    const profileLen = p.profile.trim().length
    if (bioLen < 20 && profileLen < 20) {
      err.bio = '自己紹介またはプロフィールを20文字以上入力してください'
      err.profile = '自己紹介またはプロフィールを20文字以上入力してください'
    }
    if (!p.avatar_url && !avatarFile)
      err.avatar_url = 'プロフィール画像は必須です'
    return err
  }

  const requirements = useMemo(() => {
    return {
      stage_name: profile.stage_name.trim().length > 0,
      genre: profile.genre.trim().length > 0,
      area: profile.area.length > 0,
      rate: Number(profile.rate) > 0,
      bioOrProfile:
        profile.bio.trim().length >= 20 ||
        profile.profile.trim().length >= 20,
      avatar: profile.avatar_url.trim().length > 0 || !!avatarFile,
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

      const idToLoad = code ?? user.id

      const fields =
        'name,stage_name,bio,profile,residence,area,genre,availability,min_hours,transportation,rate,notes,achievements:media_appearance,video_url,avatar_url,photos,twitterUrl:twitter_url,instagramUrl:instagram_url,youtubeUrl:youtube_url' as const

      const { data, error } = await supabase
        .from('talents' as any)
        .select(fields)
        .eq('id', idToLoad)
        .maybeSingle<any>()

      if (error) {
        console.error('プロフィールの取得に失敗:', error)
      }

      if (data) {
        setProfile({
          ...data,
          area: (data.area as string[] | null) ?? [],
          photos: (data.photos as string[] | null) ?? [],
          genre: data.genre ?? '',
          notes: data.notes ?? '',
          achievements: data.achievements ?? '',
          twitterUrl: data.twitterUrl ?? '',
          instagramUrl: data.instagramUrl ?? '',
          youtubeUrl: data.youtubeUrl ?? '',
          bio: data.bio ?? '',
          profile: data.profile ?? '',
        })
        setIsNew(false)
      } else {
        setIsNew(true)
      }
      setLoading(false)
    }

    loadProfile()
  }, [code])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    const updated = { ...profile, [name]: value }
    setProfile(updated)
    setErrors(validate(updated))
  }

  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setAvatarFile(e.target.files[0])
      setErrors(validate(profile))
    }
  }

  const handlePhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setPhotoFiles(Array.from(e.target.files))
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

    // 画像アップロード
    if (avatarFile) {
      const filePath = `${userId}/avatar-${Date.now()}`
      const { error } = await supabase.storage
        .from('talent_photos')
        .upload(filePath, avatarFile, { upsert: true })
      if (!error) {
        const { data } = await supabase.storage
          .from('talent_photos')
          .getPublicUrl(filePath)
        profile.avatar_url = data.publicUrl
      }
    }

    if (photoFiles.length > 0) {
      const urls: string[] = []
      for (const f of photoFiles) {
        const path = `${userId}/photo-${Date.now()}-${f.name}`
        const { error } = await supabase.storage
          .from('talent_photos')
          .upload(path, f, { upsert: true })
        if (!error) {
          const { data } = await supabase.storage
            .from('talent_photos')
            .getPublicUrl(path)
          urls.push(data.publicUrl)
        }
      }
      profile.photos = urls
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      console.error('ユーザー取得失敗:', authError)
      alert('ユーザー情報の取得に失敗しました')
      return
    }

    const isComplete = isProfileComplete({
      stage_name: profile.stage_name,
      genre: profile.genre,
      area: profile.area,
      rate: profile.rate === '' ? 0 : Number(profile.rate),
      bio: profile.bio,
      profile: profile.profile,
      avatar_url: profile.avatar_url,
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
      ...(profile.rate !== '' && { rate: Number(profile.rate) }),
      ...(profile.notes && { notes: profile.notes }),
      ...(profile.achievements && { media_appearance: profile.achievements }),
      ...(profile.video_url && { video_url: profile.video_url }),
      ...(profile.avatar_url && { avatar_url: profile.avatar_url }),
      ...(profile.photos.length > 0 && { photos: profile.photos }),
      ...(profile.twitterUrl && { twitter_url: profile.twitterUrl }),
      ...(profile.instagramUrl && { instagram_url: profile.instagramUrl }),
      ...(profile.youtubeUrl && { youtube_url: profile.youtubeUrl }),
      is_setup_complete: true,
      is_profile_complete: isComplete,
    }

    // Debug log before sending
    console.log('📝 updateData:', updateData)

    const { error } = await supabase
      .from('talents' as any)
      .update(updateData)
      .eq('id', user.id)

    if (error) {
      console.error('talents の保存に失敗:', error)
      alert('保存に失敗しました')
    } else {
      if (isNew) {
        router.push('/talent/edit/complete')
      } else {
        router.push('/talent/dashboard?saved=1')
      }
    }
  }

  if (loading) return <p className="p-4">読み込み中...</p>

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">演者プロフィール編集</h1>

      {/* チェックリスト */}
      <section className="p-4 bg-gray-100 rounded">
        <h2 className="font-semibold mb-2">公開の最低条件（MVP）</h2>
        <ul className="space-y-1 text-sm">
          <li className="flex items-center">
            <span className={`${requirements.stage_name ? 'text-green-500' : 'text-red-500'} mr-2`}>
              {requirements.stage_name ? '✓' : '✕'}
            </span>
            ステージ名
          </li>
          <li className="flex items-center">
            <span className={`${requirements.genre ? 'text-green-500' : 'text-red-500'} mr-2`}>
              {requirements.genre ? '✓' : '✕'}
            </span>
            ジャンル
          </li>
          <li className="flex items-center">
            <span className={`${requirements.area ? 'text-green-500' : 'text-red-500'} mr-2`}>
              {requirements.area ? '✓' : '✕'}
            </span>
            エリア
          </li>
          <li className="flex items-center">
            <span className={`${requirements.rate ? 'text-green-500' : 'text-red-500'} mr-2`}>
              {requirements.rate ? '✓' : '✕'}
            </span>
            報酬
          </li>
          <li className="flex items-center">
            <span className={`${requirements.bioOrProfile ? 'text-green-500' : 'text-red-500'} mr-2`}>
              {requirements.bioOrProfile ? '✓' : '✕'}
            </span>
            自己紹介（20文字以上）
          </li>
          <li className="flex items-center">
            <span className={`${requirements.avatar ? 'text-green-500' : 'text-red-500'} mr-2`}>
              {requirements.avatar ? '✓' : '✕'}
            </span>
            プロフィール画像
          </li>
        </ul>
      </section>

      {/* 基本情報 */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">基本情報</h2>
        <div>
          <label className="block font-semibold">本名<span className="text-red-500 ml-1">*</span></label>
          <input
            type="text"
            name="name"
            value={profile.name}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="例：山田花子"
          />
        </div>
        <div>
          <label className="block font-semibold">芸名<span className="text-red-500 ml-1">*</span></label>
          <input
            type="text"
            name="stage_name"
            value={profile.stage_name}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="例：ハナコ"
          />
          {errors.stage_name && <p className="text-red-500 text-sm">{errors.stage_name}</p>}
        </div>
        <p className="text-sm text-gray-500">※自己紹介（bio）とプロフィールのどちらか一方を20文字以上入力してください。</p>
        <div>
          <label className="block font-semibold">自己紹介（bio）<span className="text-red-500 ml-1">*</span></label>
          <textarea
            name="bio"
            maxLength={300}
            value={profile.bio}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            rows={4}
            placeholder="例：イベント出演経験があります..."
          />
          {errors.bio && <p className="text-red-500 text-sm">{errors.bio}</p>}
        </div>
        <div>
          <label className="block font-semibold">プロフィール詳細<span className="text-red-500 ml-1">*</span></label>
          <textarea
            name="profile"
            maxLength={500}
            value={profile.profile}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            rows={4}
            placeholder="経歴や活動内容などを詳しく書いてください"
          />
          {errors.profile && <p className="text-red-500 text-sm">{errors.profile}</p>}
        </div>
        <div>
          <label className="block font-semibold">拠点地域</label>
          <select
            name="residence"
            value={profile.residence}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="">選択してください</option>
            {prefectures.map(p => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-semibold mb-1">対応エリア<span className="text-red-500 ml-1">*</span></label>
          <div className="flex flex-wrap gap-2 mb-2">
            {profile.area.map((a, idx) => (
              <span key={idx} className="flex items-center bg-blue-100 px-2 py-1 rounded">
                {a}
                <button type="button" onClick={() => removeArea(idx)} className="ml-1 text-red-500">×</button>
                <button type="button" onClick={() => moveArea(idx, idx - 1)} className="ml-1 text-xs">↑</button>
                <button type="button" onClick={() => moveArea(idx, idx + 1)} className="ml-1 text-xs">↓</button>
              </span>
            ))}
          </div>
          <select onChange={handleAddArea} className="p-2 border rounded">
            <option value="">エリアを追加</option>
            {prefectures
              .filter(p => !profile.area.includes(p))
              .map(p => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
          </select>
          {errors.area && <p className="text-red-500 text-sm mt-1">{errors.area}</p>}
          <p className="text-sm text-gray-500 mt-1">例：関東一円／東海 など</p>
        </div>
        <div>
          <label className="block font-semibold">ジャンル<span className="text-red-500 ml-1">*</span></label>
          <select
            name="genre"
            value={profile.genre}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="">選択してください</option>
            {GENRE_OPTIONS.map(g => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
          {errors.genre && <p className="text-red-500 text-sm">{errors.genre}</p>}
        </div>
      </section>

      {/* 出演条件 */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">出演条件</h2>
        <div>
          <label className="block font-semibold">出演可能時間帯</label>
          <input
            type="text"
            name="availability"
            value={profile.availability}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="例: 10:00〜18:00"
          />
        </div>
        <div>
          <label className="block font-semibold">最低拘束時間</label>
          <select
            name="min_hours"
            value={profile.min_hours}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="">選択してください</option>
            {minHourOptions.map(o => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-semibold mb-1">交通費扱い</label>
          <label className="mr-4 text-sm">
            <input
              type="radio"
              name="transportation"
              value="込み"
              checked={profile.transportation === '込み'}
              onChange={handleChange}
              className="mr-1"
            />
            込み
          </label>
          <label className="text-sm">
            <input
              type="radio"
              name="transportation"
              value="別途"
              checked={profile.transportation === '別途'}
              onChange={handleChange}
              className="mr-1"
            />
            別途
          </label>
        </div>
        <div>
          <label className="block font-semibold">出演料金目安<span className="text-red-500 ml-1">*</span></label>
          <input
            type="number"
            name="rate"
            value={profile.rate}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="例：5000"
          />
          {errors.rate && <p className="text-red-500 text-sm">{errors.rate}</p>}
        </div>
        <div>
          <label className="block font-semibold">NG事項・特記事項<span className="text-gray-500 ml-1 text-sm">(任意)</span></label>
          <textarea
            name="notes"
            value={profile.notes}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            rows={3}
          />
        </div>
      </section>

      {/* 実績・PR */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">実績・PR</h2>
        <div>
          <label className="block font-semibold">来店実績<span className="text-gray-500 ml-1 text-sm">(任意)</span></label>
          <textarea
            name="achievements"
            value={profile.achievements}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            rows={3}
          />
        </div>
        <div>
          <label className="block font-semibold">動画URL<span className="text-gray-500 ml-1 text-sm">(任意)</span></label>
          <input
            type="url"
            name="video_url"
            value={profile.video_url}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block font-semibold">プロフィール画像<span className="text-red-500 ml-1">*</span></label>
          {avatarPreview && (
            <img
              src={avatarPreview}
              alt="avatar preview"
              className="w-24 h-24 object-cover mb-2"
            />
          )}
          <input type="file" accept="image/*" onChange={handleAvatar} />
          {errors.avatar_url && <p className="text-red-500 text-sm">{errors.avatar_url}</p>}
        </div>
        <div>
          <label className="block font-semibold">写真追加</label>
          <input type="file" accept="image/*" multiple onChange={handlePhotos} />
        </div>
      </section>

      {/* SNSリンク */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">SNSリンク</h2>
        <div>
          <label className="block font-semibold">X (旧Twitter)<span className="text-gray-500 ml-1 text-sm">(任意)</span></label>
          <input
            type="url"
            name="twitterUrl"
            value={profile.twitterUrl}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block font-semibold">Instagram<span className="text-gray-500 ml-1 text-sm">(任意)</span></label>
          <input
            type="url"
            name="instagramUrl"
            value={profile.instagramUrl}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block font-semibold">YouTube<span className="text-gray-500 ml-1 text-sm">(任意)</span></label>
          <input
            type="url"
            name="youtubeUrl"
            value={profile.youtubeUrl}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
      </section>

      <button
        onClick={handleSave}
        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        保存する
      </button>
    </main>
  )
}
