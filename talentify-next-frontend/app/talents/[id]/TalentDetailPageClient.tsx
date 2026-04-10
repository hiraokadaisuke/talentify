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
import { MapPin, Clock3, Timer, Bus, Wallet, Share2, Heart, MessageSquare } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import NewMessageModal from '@/components/messages/NewMessageModal'
import { findOrCreateConversation } from '@/lib/messages'
import OfferComposerOverlay from './OfferComposerOverlay'

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
  const [offerOpen, setOfferOpen] = useState(false)
  const [offerSent, setOfferSent] = useState(false)

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


  const handleOfferSuccess = () => {
    setOfferSent(true)
    router.refresh()
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
      <main className="role-page-container pt-6 pb-10">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          <Card className="overflow-hidden border-slate-200 shadow-sm">
            <CardContent className="p-4 md:p-5">
              <div className="relative mx-auto w-full max-w-2xl aspect-[4/5] max-h-[620px] overflow-hidden rounded-2xl bg-slate-100">
                {photos.length > 0 ? (
                  <Image
                    key={photos[selectedPhoto]}
                    src={photos[selectedPhoto]}
                    alt={`${talent.stage_name} ${selectedPhoto + 1}`}
                    fill
                    className={clsx('h-full w-full object-cover transition-opacity duration-300', imageLoaded ? 'opacity-100' : 'opacity-0')}
                    onLoad={() => setImageLoaded(true)}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm text-slate-500">No Image</div>
                )}
              </div>
              {photos.length > 1 && (
                <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-5">
                  {photos.map((src, i) => (
                    <button
                      key={i}
                      aria-label={`サムネイル${i + 1}`}
                      onClick={() => {
                        setSelectedPhoto(i)
                        setImageLoaded(false)
                      }}
                      className={clsx(
                        'relative aspect-square overflow-hidden rounded-lg border transition-all',
                        i === selectedPhoto
                          ? 'border-slate-800 shadow-[0_0_0_1px_rgba(15,23,42,0.2)]'
                          : 'border-slate-200 hover:border-slate-400'
                      )}
                    >
                      <Image src={src} alt={talent.stage_name} fill className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-4 lg:sticky lg:top-20 h-fit">
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="space-y-5 p-5">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{talent.stage_name}</h1>
                  {talent.profile && <p className="mt-2 text-sm text-slate-700 whitespace-pre-line">{talent.profile}</p>}
                </div>

                <div className="space-y-2.5">
                  <Button
                    className="h-11 w-full bg-slate-900 text-white hover:bg-slate-800"
                    aria-label="このキャストにオファーする"
                    onClick={() => setOfferOpen(true)}
                    disabled={offerSent}
                  >
                    {offerSent ? '送信済み' : 'このキャストにオファーする'}
                  </Button>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    {(role === 'store' || role === null) && (
                      <Button variant="outline" className="w-full border-slate-300" aria-label="メッセージを送る" onClick={handleMessage}>
                        <MessageSquare className="mr-1 h-4 w-4" />
                        メッセージ
                      </Button>
                    )}
                    <Button variant="outline" className="w-full border-slate-300" aria-label="シェア" onClick={handleShare}>
                      <Share2 className="mr-1 h-4 w-4" />
                      シェア
                    </Button>
                    <Button variant="outline" className="w-full border-slate-300" aria-label="お気に入り" onClick={handleFavorite}>
                      <Heart className={clsx('mr-1 h-4 w-4', isFavorite ? 'fill-current text-red-500' : '')} />
                      お気に入り
                    </Button>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  {[
                    { icon: MapPin, label: '拠点地域', value: talent.residence || '要相談' },
                    { icon: Clock3, label: '出演可能時間', value: talent.availability || '要相談' },
                    { icon: Timer, label: '最低拘束時間', value: talent.min_hours || '要相談' },
                    { icon: Bus, label: '交通費', value: talent.transportation || '要相談' },
                    { icon: Wallet, label: '出演料金目安', value: talent.rate != null ? `${talent.rate.toLocaleString()}円〜` : '要相談' },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-center gap-2 border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                      <Icon className="h-4 w-4 text-slate-500" />
                      <span className="min-w-24 text-slate-500">{label}</span>
                      <span className="font-medium text-slate-900">{value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {role === 'talent' && userId === talent.user_id && (
              <Button className="w-full" aria-label="プロフィールを編集する" onClick={() => (window.location.href = '/talent/edit')}>
                プロフィールを編集する
              </Button>
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {(talent.area.length > 0 || talent.genre) && (
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="space-y-4 p-5">
                {talent.area.length > 0 && (
                  <div>
                    <p className="mb-2 text-sm font-semibold text-slate-800">対応エリア</p>
                    <div className="flex flex-wrap gap-2">
                      {talent.area.map(p => (
                        <Badge key={p} variant="secondary" className="rounded-full border border-slate-200 bg-slate-50 text-slate-700">
                          {p}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {talent.genre && (
                  <div>
                    <p className="mb-2 text-sm font-semibold text-slate-800">ジャンル</p>
                    <Badge variant="secondary" className="rounded-full border border-slate-200 bg-slate-50 text-slate-700">
                      {talent.genre}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {(talent.twitter || talent.instagram || talent.youtube) && (
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-5">
                <p className="mb-2 text-sm font-semibold text-slate-800">SNS</p>
                <div className="flex gap-4 text-xl text-slate-700">
                  {talent.twitter && (
                    <a href={talent.twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="hover:text-slate-900">
                      <FaTwitter />
                    </a>
                  )}
                  {talent.instagram && (
                    <a href={talent.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-slate-900">
                      <FaInstagram />
                    </a>
                  )}
                  {talent.youtube && (
                    <a href={talent.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="hover:text-slate-900">
                      <FaYoutube />
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="border-slate-200 shadow-sm md:col-span-2">
            <CardContent className="grid gap-6 p-5 md:grid-cols-2 text-sm">
              <div>
                <p className="font-semibold text-slate-800">NG事項 / 特記事項</p>
                <p className="mt-2 whitespace-pre-line text-slate-700">{talent.notes ? talent.notes : '特にありません'}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-800">来店実績 / PR文</p>
                <p className="mt-2 whitespace-pre-line text-slate-700">{talent.media_appearance ? talent.media_appearance : '準備中'}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

    <OfferComposerOverlay
      open={offerOpen}
      onOpenChange={setOfferOpen}
      talentId={id}
      summary={{
        stageName: talent.stage_name,
        residence: talent.residence,
        availability: talent.availability,
        minHours: talent.min_hours,
        transportation: talent.transportation,
        rate: talent.rate,
      }}
      onSuccess={handleOfferSuccess}
    />
    <NewMessageModal
      open={messageOpen}
      onOpenChange={setMessageOpen}
      conversationId={talent.user_id ?? ''}
      talentName={talent.stage_name}
    />
    </>
  )
}
