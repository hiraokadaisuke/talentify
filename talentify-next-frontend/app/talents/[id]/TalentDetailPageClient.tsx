'use client'


import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/utils/supabase/client'
import { useUserRole } from '@/utils/useRole'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FaTwitter, FaInstagram, FaYoutube } from 'react-icons/fa'

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
  const [showForm, setShowForm] = useState(false)
  const [visitDate1, setVisitDate1] = useState('')
  const [visitDate2, setVisitDate2] = useState('')
  const [visitDate3, setVisitDate3] = useState('')
  const [timeRange, setTimeRange] = useState('')
  const [note, setNote] = useState('')
  const [isAgreed, setIsAgreed] = useState(false)
  const [submitted, setSubmitted] = useState(false)

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

  if (loadingTalent || roleLoading) return <div>読み込み中...</div>
  if (!talent) return <div>タレントが見つかりませんでした</div>


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      alert('ログインしてください')
      return
    }

    const message = `第1希望:${visitDate1}\n第2希望:${visitDate2}\n第3希望:${visitDate3}\n希望時間帯:${timeRange}\n備考:${note}`
    const payload = {
      user_id: user.id,
      talent_id: id,
      message,
      date: visitDate1,
      second_date: visitDate2 || null,
      third_date: visitDate3 || null,
      time_range: timeRange || null,
      notes: note || null,
      agreed: isAgreed,
      status: 'pending'
    }

    const { error } = await supabase.from('offers').insert([payload])
    if (error) {
      console.log('offer insert error', { payload, error })
      alert('送信に失敗しました')
      return
    }

    setSubmitted(true)
  }

  return (
    <main className="max-w-3xl mx-auto p-4 space-y-6 mt-16 scroll-mt-16">
      <Card>
        <CardContent className="flex flex-col sm:flex-row gap-4 items-start">
          <div className="w-full sm:w-48 h-48 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
            {talent.avatar_url && (
              <Image
                src={talent.avatar_url}
                alt={talent.stage_name}
                width={192}
                height={192}
                className="object-cover w-full h-full"
              />
            )}
          </div>
          <div className="flex-1 space-y-2 text-sm">
            <h1 className="text-3xl font-bold">{talent.stage_name}</h1>
            {talent.profile && <p className="whitespace-pre-line">{talent.profile}</p>}
            <div className="flex gap-3 mt-2 text-lg">
              {talent.twitter && (
                <a href={talent.twitter} target="_blank" rel="noopener noreferrer">
                  <FaTwitter />
                </a>
              )}
              {talent.instagram && (
                <a href={talent.instagram} target="_blank" rel="noopener noreferrer">
                  <FaInstagram />
                </a>
              )}
              {talent.youtube && (
                <a href={talent.youtube} target="_blank" rel="noopener noreferrer">
                  <FaYoutube />
                </a>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {(talent.residence || talent.area.length > 0 || talent.genre) && (
        <Card>
          <CardContent className="space-y-2 text-sm">
            {talent.residence && <p>拠点地域: {talent.residence}</p>}
            {talent.area.length > 0 && (
              <div>
                <p className="font-semibold">対応エリア</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {talent.area.map(p => (
                    <Badge key={p} variant="secondary">
                      {p}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {talent.genre && <p>ジャンル: {talent.genre}</p>}
          </CardContent>
        </Card>
      )}

      {(talent.availability || talent.min_hours || talent.transportation || talent.rate || talent.notes) && (
        <Card>
          <CardContent className="space-y-2 text-sm">
            {talent.availability && <p>出演可能時間帯: {talent.availability}</p>}
            {talent.min_hours && <p>最低拘束時間: {talent.min_hours}</p>}
            {talent.transportation && <p>交通費扱い: {talent.transportation}</p>}
            {talent.rate != null && <p>出演料金目安: {talent.rate.toLocaleString()}円</p>}
            {talent.notes && <p>NG事項・特記事項: {talent.notes}</p>}
          </CardContent>
        </Card>
      )}

      {(talent.media_appearance || talent.video_url) && (
        <Card>
          <CardContent className="space-y-2 text-sm">
            {talent.media_appearance && (
              <div>
                <p className="font-semibold">来店実績／PR文</p>
                <p className="whitespace-pre-line">{talent.media_appearance}</p>
              </div>
            )}
            {talent.video_url && (
              (() => {
                const m = talent.video_url.match(/(?:youtu.be\/|youtube.com\/.+v=)([^&]+)/)
                return m ? (
                  <div className="aspect-video">
                    <iframe
                      src={`https://www.youtube.com/embed/${m[1]}`}
                      className="w-full h-full"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <a
                    href={talent.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    動画を見る
                  </a>
                )
              })()
            )}
          </CardContent>
        </Card>
      )}

      {Array.isArray(talent.photos) && talent.photos.length > 0 && (
        <Card>
          <CardContent>
            <div className="flex overflow-x-auto gap-3 pb-2">
              {talent.photos.map((p, i) => (
                <div
                  key={i}
                  className="flex-none w-40 h-40 rounded-lg overflow-hidden bg-gray-100"
                >
                  <Image
                    src={p}
                    alt={`${talent.stage_name} ${i + 1}`}
                    width={160}
                    height={160}
                    className="object-cover w-full h-full"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {role === 'store' && (
          <>
            {!submitted ? (
              <>
                <Button onClick={() => setShowForm(v => !v)} className="w-full">
                  {showForm ? 'フォームを閉じる' : 'オファーする'}
                </Button>
                {showForm && (
                  <form onSubmit={handleSubmit} className="space-y-4 border p-4 rounded">
                    <div>
                      <label className="block text-sm font-medium mb-1">来店希望日(第1希望)</label>
                      <Input type="date" value={visitDate1} onChange={e => setVisitDate1(e.target.value)} required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">来店希望日(第2希望)</label>
                      <Input type="date" value={visitDate2} onChange={e => setVisitDate2(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">来店希望日(第3希望)</label>
                      <Input type="date" value={visitDate3} onChange={e => setVisitDate3(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">希望時間帯</label>
                      <Input value={timeRange} onChange={e => setTimeRange(e.target.value)} placeholder="例: 10:00〜18:00" />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        id="is-agreed"
                        type="checkbox"
                        checked={isAgreed}
                        onChange={e => setIsAgreed(e.target.checked)}
                        required
                      />
                      <label htmlFor="is-agreed" className="text-sm">出演条件に同意します</label>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">備考（任意）</label>
                      <Textarea value={note} onChange={e => setNote(e.target.value)} />
                    </div>
                    <Button type="submit" disabled={!isAgreed}>送信</Button>
                  </form>
                )}
              </>
            ) : (
              <div className="p-4 border rounded text-sm">
                <p>送信完了しました。オファーステータスはダッシュボードで確認できます。</p>
              </div>
            )}
          </>
        )}
        {role === 'talent' && userId === talent.user_id && (
          <Button onClick={() => (window.location.href = '/talent/edit')}>
            プロフィールを編集する
          </Button>
        )}
      </div>
    </main>
  )
}
