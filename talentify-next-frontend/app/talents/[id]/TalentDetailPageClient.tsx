'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import clsx from 'clsx'
import { createClient } from '@/utils/supabase/client'
import { useUserRole } from '@/utils/useRole'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FaInstagram, FaTiktok, FaXTwitter, FaYoutube } from 'react-icons/fa6'
import { MapPin, Clock3, Timer, Bus, Wallet, Heart, MessageSquare, Star } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import OfferComposerOverlay from './OfferComposerOverlay'
import TalentSchedulePreview from './TalentSchedulePreview'

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
  twitter_url?: string | null
  instagram_url?: string | null
  youtube_url?: string | null
  social_tiktok?: string | null
  preferred_contact_method?: string | null
  phone_contact_allowed?: boolean | null
  phone_available_hours?: string | null
}

type PublicReview = {
  id: string
  rating: number
  comment?: string | null
  category_ratings: Record<string, number>
  created_at: string
}

type Props = {
  id: string
  initialTalent?: Talent | null
  initialReviews?: PublicReview[]
}

export default function TalentDetailPageClient({ id, initialTalent, initialReviews = [] }: Props) {
  const supabase = useMemo(() => createClient(), [])
  const [talent, setTalent] = useState<Talent | null>(initialTalent ?? null)
  const [loadingTalent, setLoadingTalent] = useState(!initialTalent)
  const [userId, setUserId] = useState<string | null>(null)
  const { role, loading: roleLoading } = useUserRole()
  const [selectedPhoto, setSelectedPhoto] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)
  const [favoriteLoading, setFavoriteLoading] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const router = useRouter()
  const [offerOpen, setOfferOpen] = useState(false)
  const [offerInitialDate, setOfferInitialDate] = useState<string | null>(null)
  const [offerSent, setOfferSent] = useState(false)
  const reviewAverage =
    initialReviews.length > 0
      ? initialReviews.reduce((sum, review) => sum + review.rating, 0) / initialReviews.length
      : null

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
    if (!userId || role !== 'store' || !id) return

    let cancelled = false
    setFavoriteLoading(true)

    fetch(`/api/store/favorites/${id}`)
      .then(async res => {
        if (!res.ok) throw new Error('お気に入り状態を取得できませんでした')
        return res.json()
      })
      .then(data => {
        if (!cancelled) setIsFavorite(Boolean(data.isFavorite))
      })
      .catch(error => {
        console.error(error)
      })
      .finally(() => {
        if (!cancelled) setFavoriteLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [id, role, userId])

  if (loadingTalent || roleLoading) return <div>読み込み中...</div>
  if (!talent) return <div>タレントが見つかりませんでした</div>

  const photos = [
    ...(talent.avatar_url ? [talent.avatar_url] : []),
    ...(Array.isArray(talent.photos) ? talent.photos : []),
  ]

  const handleFavorite = async () => {
    if (!userId) {
      window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`
      return
    }

    if (role !== 'store') {
      toast.error('お気に入りは店舗アカウントで利用できます')
      return
    }

    setFavoriteLoading(true)
    try {
      const res = await fetch(`/api/store/favorites/${id}`, {
        method: isFavorite ? 'DELETE' : 'POST',
      })
      const result = await res.json().catch(() => null)

      if (!res.ok) {
        throw new Error(result?.error || 'お気に入りの更新に失敗しました')
      }

      const next = !isFavorite
      setIsFavorite(next)
      toast.success(next ? 'お気に入りに追加しました' : 'お気に入りを解除しました')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'お気に入りの更新に失敗しました')
    } finally {
      setFavoriteLoading(false)
    }
  }


  const handleOfferSuccess = () => {
    setOfferSent(true)
    toast.success('オファーを送信しました')
  }

  const handleMessage = () => {
    if (!talent?.user_id) return
    const destination = `/store/messages?tab=direct&partner=${encodeURIComponent(talent.user_id)}`
    if (!userId) {
      window.location.href = `/login?redirect=${encodeURIComponent(destination)}`
      return
    }
    if (role !== 'store') return
    router.push(destination)
  }

  return (
    <>
      <main className="min-h-[calc(100vh-4rem)] bg-[#f1f5f9] px-3 pt-6 pb-10 sm:px-5 lg:px-6">
        <div className="mx-auto grid w-full max-w-6xl lg:max-w-[1400px] gap-4 lg:grid-cols-[minmax(0,.92fr)_minmax(420px,1.08fr)] lg:items-stretch">
          <Card className="h-full overflow-hidden border-slate-200 shadow-sm">
            <CardContent className="flex h-full flex-col p-3.5 md:p-4">
              <div className="relative mx-auto h-[min(65vh,680px)] w-full max-w-2xl overflow-hidden rounded-xl bg-slate-100 lg:h-full">
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
                <div className="mt-3 grid grid-cols-4 gap-1.5 sm:grid-cols-5">
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

          <div className="space-y-3">
            <Card className="h-full border-slate-200 shadow-sm">
              <CardContent className="flex h-full flex-col gap-4 p-4 md:p-4">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight md:text-[1.75rem]">{talent.stage_name}</h1>
                  {reviewAverage !== null && (
                    <div className="mt-2 flex items-center gap-2 text-sm">
                      <div className="flex items-center gap-0.5 text-amber-500">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="font-bold text-slate-900">{reviewAverage.toFixed(1)}</span>
                      </div>
                      <span className="text-slate-500">公開レビュー {initialReviews.length}件</span>
                    </div>
                  )}
                  {talent.profile && <p className="mt-1.5 text-sm leading-relaxed text-slate-700 whitespace-pre-line">{talent.profile}</p>}
                </div>

                <div className="space-y-2">
                  <Button
                    className="h-10 w-full bg-slate-900 text-white transition-all duration-150 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md active:translate-y-0 focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-1"
                    aria-label="このキャストにオファーする"
                    onClick={() => {
                      setOfferInitialDate(null)
                      setOfferOpen(true)
                    }}
                    disabled={offerSent}
                  >
                    {offerSent ? '送信済み' : 'このキャストにオファーする'}
                  </Button>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {(role === 'store' || role === null) && (
                      <Button
                        variant="outline"
                        className="w-full border-slate-300 bg-white transition-all duration-150 hover:-translate-y-0.5 hover:border-slate-400 hover:bg-slate-50 hover:shadow-sm active:translate-y-0 focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-1"
                        aria-label="メッセージを送る"
                        onClick={handleMessage}
                      >
                        <MessageSquare className="mr-1 h-4 w-4" />
                        メッセージ
                      </Button>
                    )}
                    {(role === 'store' || role === null) && (
                      <Button
                        variant="outline"
                        className="w-full border-slate-300 bg-white transition-all duration-150 hover:-translate-y-0.5 hover:border-slate-400 hover:bg-slate-50 hover:shadow-sm active:translate-y-0 focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-1"
                        aria-label="お気に入り"
                        aria-pressed={isFavorite}
                        onClick={handleFavorite}
                        disabled={favoriteLoading}
                      >
                        <Heart className={clsx('mr-1 h-4 w-4', isFavorite ? 'fill-current text-red-500' : '')} />
                        {isFavorite ? 'お気に入り済み' : 'お気に入り'}
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-2.5 text-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">取引条件</p>
                  {[
                    { icon: MapPin, label: '活動拠点', value: talent.residence || '未設定' },
                    { icon: Clock3, label: '出演可能時間', value: talent.availability || '要相談' },
                    { icon: Timer, label: '最低拘束時間', value: talent.min_hours || '要相談' },
                    { icon: Bus, label: '交通費', value: talent.transportation || '要相談' },
                    { icon: Wallet, label: '出演料金目安', value: talent.rate != null ? `${talent.rate.toLocaleString()}円〜` : '要相談' },
                    {
                      icon: MessageSquare,
                      label: '連絡方法',
                      value: talent.phone_contact_allowed
                        ? talent.preferred_contact_method === 'phone'
                          ? '電話対応可'
                          : 'チャット推奨・電話も可'
                        : 'チャットのみ',
                    },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-center gap-2">
                      <Icon className="h-4 w-4 shrink-0 text-slate-500" />
                      <span className="min-w-24 text-slate-500">{label}</span>
                      <span className="font-medium text-slate-900">{value}</span>
                    </div>
                  ))}
                </div>

                {talent.phone_contact_allowed && talent.phone_available_hours && (
                  <p className="text-xs text-slate-500">電話可能時間帯：{talent.phone_available_hours}</p>
                )}

                {(talent.area.length > 0 || talent.genre) && (
                  <div className="space-y-2.5 border-t border-slate-100 pt-3">
                    {talent.area.length > 0 && (
                      <div>
                        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">来店可能エリア</p>
                        <div className="flex flex-wrap gap-1.5">
                          {talent.area.map(p => (
                            <Badge key={p} variant="secondary" className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-700">
                              {p}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {talent.genre && (
                      <div>
                        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">ジャンル</p>
                        <Badge variant="secondary" className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-700">
                          {talent.genre}
                        </Badge>
                      </div>
                    )}
                  </div>
                )}

                {talent.notes && (
                  <div className="space-y-1.5 border-t border-slate-100 pt-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">NG事項 / 特記事項</p>
                    <p className="text-sm leading-relaxed whitespace-pre-line text-slate-700">{talent.notes}</p>
                  </div>
                )}

                {talent.media_appearance && (
                  <div className="space-y-1.5 border-t border-slate-100 pt-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">店舗向けPR文</p>
                    <p className="max-w-prose text-sm leading-relaxed whitespace-pre-line text-slate-700">{talent.media_appearance}</p>
                  </div>
                )}

                {(talent.twitter_url || talent.instagram_url || talent.youtube_url || talent.social_tiktok) && (
                  <div className="space-y-2 border-t border-slate-100 pt-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">SNS</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: 'X', href: talent.twitter_url, icon: FaXTwitter },
                        { label: 'Instagram', href: talent.instagram_url, icon: FaInstagram },
                        { label: 'YouTube', href: talent.youtube_url, icon: FaYoutube },
                        { label: 'TikTok', href: talent.social_tiktok, icon: FaTiktok },
                      ]
                        .filter(item => Boolean(item.href))
                        .map(({ label, href, icon: Icon }) => (
                          <a
                            key={label}
                            href={href!}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`${talent.stage_name}の${label}を開く`}
                            title={label}
                            className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white text-lg text-slate-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-[#C2410C] focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-300"
                          >
                            <Icon />
                          </a>
                        ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {role === 'talent' && userId === talent.user_id && (
              <Button className="w-full" aria-label="プロフィールを編集する" onClick={() => (window.location.href = '/talent/edit')}>
                プロフィールを編集する
              </Button>
            )}
          </div>
        </div>

        {role === 'store' && (
          <div className="mx-auto w-full max-w-6xl lg:max-w-[1400px]">
            <TalentSchedulePreview
              talentId={id}
              onOfferDate={date => {
                setOfferInitialDate(date)
                setOfferOpen(true)
              }}
            />
          </div>
        )}

        <section className="mx-auto mt-4 w-full max-w-6xl lg:max-w-[1400px]">
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-4 sm:p-5">
              <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Reviews</p>
                  <h2 className="mt-1 text-xl font-bold text-slate-950">ホールからの評価・レビュー</h2>
                </div>
                {reviewAverage !== null && (
                  <div className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-sm">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="font-bold">{reviewAverage.toFixed(1)}</span>
                    <span className="text-slate-500">/ 5</span>
                  </div>
                )}
              </div>

              {initialReviews.length === 0 ? (
                <p className="mt-4 text-sm text-slate-500">公開されているレビューはまだありません。</p>
              ) : (
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {initialReviews.map(review => (
                    <article key={review.id} className="min-w-0 rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-1 text-amber-500">
                          {[1, 2, 3, 4, 5].map(value => (
                            <Star
                              key={value}
                              className={clsx(
                                'h-4 w-4',
                                value <= review.rating ? 'fill-current' : 'text-slate-300',
                              )}
                            />
                          ))}
                          <span className="ml-1 font-semibold text-slate-900">{review.rating.toFixed(1)}</span>
                        </div>
                        <time className="shrink-0 text-xs text-slate-400">
                          {new Date(review.created_at).toLocaleDateString('ja-JP')}
                        </time>
                      </div>

                      {review.comment && (
                        <p className="mt-3 break-words text-sm leading-6 text-slate-700">{review.comment}</p>
                      )}

                      {Object.keys(review.category_ratings).length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {Object.entries(review.category_ratings).map(([key, value]) => {
                            const label =
                              key === 'time'
                                ? '時間厳守'
                                : key === 'attitude'
                                  ? '接客態度'
                                  : key === 'fan'
                                    ? 'ファンサービス'
                                    : key === 'play'
                                      ? '遊技姿勢'
                                      : key
                            return (
                              <span
                                key={key}
                                className="rounded-full border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600"
                              >
                                {label} {value}/5
                              </span>
                            )
                          })}
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              )}

              {role === 'talent' && userId === talent.user_id && (
                <div className="mt-4 border-t border-slate-100 pt-4">
                  <Button variant="outline" asChild className="w-full sm:w-auto">
                    <Link href="/talent/reviews">すべての自分のレビューを見る</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </section>
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
      initialDate={offerInitialDate}
    />
    </>
  )
}
