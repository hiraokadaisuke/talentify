'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import clsx from 'clsx'
import { createClient } from '@/utils/supabase/client'
import { useUserRole } from '@/utils/useRole'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FaTwitter, FaInstagram, FaYoutube } from 'react-icons/fa'
import { MapPin, Clock3, Timer, Bus, Wallet, Share2, Heart, PaperPlane } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import NewMessageModal from '@/components/messages/NewMessageModal'
import { findOrCreateConversation } from '@/lib/messages'

type Talent = {
  id: string
  user_id: string | null
  stage_name: string
  profile?: string | null
  residence?: string | null
  area: string[]
  genre?: string | null
  availability?: string | null
  min_hours?: string | null
  transportation?: string | null
  rate?: number | null
  notes?: string | null
  media_appearance?: string | null
  video_url?: string | null
  avatar_url?: string | null
  photos: string[]
  twitter?: string | null
  instagram?: string | null
  youtube?: string | null
}

type Props = {
  id: string
  initialTalent?: Talent | null
}

export default function TalentDetailPageClient({ id, initialTalent }: Props) {
  const supabase = createClient()
  const [talent, setTalent] = useState<Talent | null>(initialTalent ?? null)
  const [loadingTalent, setLoadingTalent] = useState(!initialTalent)
  const [userId, setUserId] = useState<string | null>(null)
  const { role, loading: roleLoading } = useUserRole()
  const [selectedPhoto, setSelectedPhoto] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const router = useRouter()
  const [messageOpen, setMessageOpen] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      if (!initialTalent) {
        const res = await fetch(`/api/talents/${id}`)
        if (res.ok) {
          const data = await res.json()
          setTalent(data)
        } else {
          const text = await res.text()
          console.error('Failed to fetch talent:', text)
        }
      }

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) setUserId(user.id)
    }

    if (id) {
      fetchData().finally(() => setLoadingTalent(false))
    }
  }, [id, supabase, initialTalent])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.get('message') === '1') {
        setMessageOpen(true)
      }
    }
  }, [])

  if (loadingTalent || roleLoading) return <div>読み込み中...</div>
  if (!talent) return <div>タレントが見つかりませんでした</div>

  const photos = [
    ...(talent.avatar_url ? [talent.avatar_url] : []),
    ...(Array.isArray(talent.photos) ? talent.photos : []),
  ]

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast.success('URLをコピーしました')
    } catch {
      toast.error('コピーに失敗しました')
    }
  }

  const handleFavorite = () => {
    setIsFavorite(v => !v)
    toast.success(isFavorite ? 'お気に入りを解除しました' : 'お気に入りに追加しました')
  }

  const handleMessage = async () => {
    if (!talent?.user_id) return
    if (!userId) {
      const redirect = `${window.location.pathname}?message=1`
      window.location.href = `/login?redirect=${encodeURIComponent(redirect)}`
      return
    }
    if (role !== 'store') return
    const { conversationId, exists } = await findOrCreateConversation(userId, talent.user_id)
    if (exists) {
      router.push(`/messages/${conversationId}`)
    } else {
      setMessageOpen(true)
    }
  }

  return (
    <>
    <main className="w-full max-w-[1333px] mx-auto p-4 mt-16 grid gap-8 md:grid-cols-[60%_40%]">
      {/* 左カラム: 画像ギャラリー */}
      <div className="w-full md:max-w-[800px]">
        <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden bg-gray-100">
          {photos.length > 0 ? (
            <Image
              key={photos[selectedPhoto]}
              src={photos[selectedPhoto]}
              alt={`${talent.stage_name} ${selectedPhoto + 1}`}
              fill
              className={clsx('object-cover w-full h-full transition-opacity duration-300', imageLoaded ? 'opacity-100' : 'opacity-0')}
              onLoad={() => setImageLoaded(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500">No Image</div>
          )}
        </div>
        {photos.length > 1 && (
          <div className="grid grid-cols-4 gap-2 mt-2">
            {photos.map((src, i) => (
              <button
                key={i}
                aria-label={`サムネイル${i + 1}`}
                onClick={() => {
                  setSelectedPhoto(i)
                  setImageLoaded(false)
                }}
                className={clsx(
                  'relative w-full h-[100px] rounded-lg overflow-hidden border',
                  i === selectedPhoto ? 'border-blue-500' : 'border-transparent hover:border-gray-300'
                )}
              >
                <Image src={src} alt={talent.stage_name} fill className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 右カラム: 詳細情報 */}
      <div className="space-y-6 md:sticky md:top-16 h-fit">
        <div>
          <h1 className="text-3xl font-bold">{talent.stage_name}</h1>
          {talent.profile && <p className="mt-1 text-sm whitespace-pre-line">{talent.profile}</p>}
        </div>

        {/* CTA ボタン群 */}
        <div className="space-y-2">
          <Button className="w-full" aria-label="このキャストにオファーする" onClick={() => (window.location.href = `/talents/${id}/offer`)}>
            このキャストにオファーする
          </Button>
          <div className="flex gap-2">
            {(role === 'store' || role === null) && (
              <Button variant="outline" className="flex-1" aria-label="メッセージを送る" onClick={handleMessage}>
                <PaperPlane className="w-4 h-4 mr-1" />メッセージを送る
              </Button>
            )}
            <Button variant="outline" className="flex-1" aria-label="シェア" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-1" />シェア
            </Button>
            <Button variant="outline" className="flex-1" aria-label="お気に入り" onClick={handleFavorite}>
              <Heart className={clsx('w-4 h-4 mr-1', isFavorite ? 'fill-current text-red-500' : '')} />お気に入り
            </Button>
          </div>
        </div>

        {/* クイック情報 */}
        <Card>
          <CardContent className="space-y-2 text-sm">
            {[
              { icon: MapPin, label: '拠点地域', value: talent.residence || '要相談' },
              { icon: Clock3, label: '出演可能時間', value: talent.availability || '要相談' },
              { icon: Timer, label: '最低拘束時間', value: talent.min_hours || '要相談' },
              { icon: Bus, label: '交通費', value: talent.transportation || '要相談' },
              { icon: Wallet, label: '出演料金目安', value: talent.rate != null ? `${talent.rate.toLocaleString()}円〜` : '要相談' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-2">
                <Icon className="w-4 h-4" />
                <span className="text-gray-600">{label}:</span>
                <span>{value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* タグ */}
        {(talent.area.length > 0 || talent.genre) && (
          <div className="space-y-2">
            {talent.area.length > 0 && (
              <div>
                <p className="text-sm font-semibold mb-1">対応エリア</p>
                <div className="flex flex-wrap gap-2">
                  {talent.area.map(p => (
                    <Badge key={p} variant="secondary" className="rounded-full">
                      {p}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {talent.genre && (
              <div>
                <p className="text-sm font-semibold mb-1">ジャンル</p>
                <Badge variant="secondary" className="rounded-full">
                  {talent.genre}
                </Badge>
              </div>
            )}
          </div>
        )}

        {/* テキストセクション */}
        <div className="space-y-4 text-sm">
          <div>
            <p className="font-semibold">NG事項 / 特記事項</p>
            <p className="mt-1 whitespace-pre-line">{talent.notes ? talent.notes : '特にありません'}</p>
          </div>
          <div>
            <p className="font-semibold">来店実績 / PR文</p>
            <p className="mt-1 whitespace-pre-line">{talent.media_appearance ? talent.media_appearance : '準備中'}</p>
          </div>
        </div>

        {/* SNSリンク */}
        {(talent.twitter || talent.instagram || talent.youtube) && (
          <div className="flex gap-3 text-lg">
            {talent.twitter && (
              <a href={talent.twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                <FaTwitter />
              </a>
            )}
            {talent.instagram && (
              <a href={talent.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <FaInstagram />
              </a>
            )}
            {talent.youtube && (
              <a href={talent.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                <FaYoutube />
              </a>
            )}
          </div>
        )}

        {role === 'talent' && userId === talent.user_id && (
          <Button className="w-full" aria-label="プロフィールを編集する" onClick={() => (window.location.href = '/talent/edit')}>
            プロフィールを編集する
          </Button>
        )}
      </div>
    </main>
    <NewMessageModal
      open={messageOpen}
      onOpenChange={setMessageOpen}
      conversationId={talent.user_id ?? ''}
      talentName={talent.stage_name}
    />
    </>
  )
}

