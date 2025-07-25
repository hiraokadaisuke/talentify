'use client'


import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

const prefectures = [
  '北海道','青森県','岩手県','宮城県','秋田県','山形県','福島県','茨城県','栃木県','群馬県','埼玉県','千葉県','東京都','神奈川県','新潟県','富山県','石川県','福井県','山梨県','長野県','岐阜県','静岡県','愛知県','三重県','滋賀県','京都府','大阪府','兵庫県','奈良県','和歌山県','鳥取県','島根県','岡山県','広島県','山口県','徳島県','香川県','愛媛県','高知県','福岡県','佐賀県','長崎県','熊本県','大分県','宮崎県','鹿児島県','沖縄県'
]

const genres = ['ライター','アイドル','コスプレ','モデル','その他']
const minHourOptions = ['1時間','2時間','3時間以上']

const supabase = createClient()

export default function TalentProfileEditPageClient({ code }: { code?: string | null }) {
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState({
    name: '',
    stage_name: '',
    description: '',
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
    twitter: '',
    instagram: '',
    youtube: ''
  })
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [photoFiles, setPhotoFiles] = useState<File[]>([])

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

      const fields = 'name,stage_name,description:profile,residence,area,genre,availability,min_hours,transportation,rate,notes,achievements:media_appearance,video_url,avatar_url,photos,twitter:social_x,instagram:social_instagram,youtube:social_youtube' as const

      const { data, error } = await supabase
        .from('talents' as any)
        .select(fields)
        .eq('id', user.id)
        .maybeSingle<any>()

      if (error || !data) {
        console.error('プロフィールの取得に失敗:', error)
      }

      if (data)
        setProfile({
          ...data,
          area: (data.area as string[] | null) ?? [],
          photos: (data.photos as string[] | null) ?? [],
          genre: data.genre ?? '',
          notes: data.notes ?? '',
          achievements: data.achievements ?? '',
        })
      setLoading(false)
    }

    loadProfile()
  }, [supabase])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement
      if (checked) {
        setProfile(prev => ({ ...prev, [name]: [...(prev as any)[name], value] }))
      } else {
        setProfile(prev => ({
          ...prev,
          [name]: (prev as any)[name].filter((v: string) => v !== value)
        }))
      }
    } else {
      setProfile({ ...profile, [name]: value })
    }
  }

  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setAvatarFile(e.target.files[0])
  }

  const handlePhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setPhotoFiles(Array.from(e.target.files))
  }

  const handleSave = async () => {
    if (!userId) return

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

    const updateData = {
      id: user.id,
      name: profile.name,
      stage_name: profile.stage_name,
      profile: profile.description || null,
      residence: profile.residence || null,
      area: profile.area.length > 0 ? profile.area : null,
      genre: profile.genre || null,
      availability: profile.availability || null,
      min_hours: profile.min_hours || null,
      transportation: profile.transportation || null,
      rate: profile.rate !== '' ? Number(profile.rate) : null,
      notes: profile.notes || null,
      media_appearance: profile.achievements || null,
      video_url: profile.video_url || null,
      avatar_url: profile.avatar_url || null,
      photos: profile.photos.length > 0 ? profile.photos : null,
      social_x: profile.twitter || null,
      social_instagram: profile.instagram || null,
      social_youtube: profile.youtube || null,
      is_setup_complete: true,
    }

    // Debug log before sending
    console.log('📝 updateData:', updateData)

    const { error } = await supabase
      .from('talents' as any)
      .upsert(updateData, { onConflict: 'id' })

    if (error) {
      console.error('talents の保存に失敗:', error)
      alert('保存に失敗しました')
    } else {
      alert('保存しました')
    }
  }

  if (loading) return <p className="p-4">読み込み中...</p>

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">演者プロフィール編集</h1>

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
          />
        </div>
        <div>
          <label className="block font-semibold">自己紹介<span className="text-gray-500 ml-1 text-sm">(任意)</span></label>
          <textarea
            name="description"
            maxLength={300}
            value={profile.description}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            rows={4}
          />
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
          <label className="block font-semibold mb-1">対応エリア</label>
          <div className="flex flex-wrap gap-2">
            {prefectures.map(p => (
              <label key={p} className="text-sm">
                <input
                  type="checkbox"
                  name="area"
                  value={p}
                  checked={profile.area.includes(p)}
                  onChange={handleChange}
                  className="mr-1"
                />
                {p}
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="block font-semibold">ジャンル<span className="text-gray-500 ml-1 text-sm">(任意)</span></label>
          <select
            name="genre"
            value={profile.genre}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="">選択してください</option>
            {genres.map(g => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
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
          <label className="block font-semibold">出演料金目安<span className="text-gray-500 ml-1 text-sm">(任意)</span></label>
          <input
            type="number"
            name="rate"
            value={profile.rate}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="円"
          />
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
          <label className="block font-semibold">プロフィール画像</label>
          <input type="file" accept="image/*" onChange={handleAvatar} />
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
            name="twitter"
            value={profile.twitter}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block font-semibold">Instagram<span className="text-gray-500 ml-1 text-sm">(任意)</span></label>
          <input
            type="url"
            name="instagram"
            value={profile.instagram}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block font-semibold">YouTube<span className="text-gray-500 ml-1 text-sm">(任意)</span></label>
          <input
            type="url"
            name="youtube"
            value={profile.youtube}
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
