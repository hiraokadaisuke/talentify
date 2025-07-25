'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { format, isBefore, parseISO } from 'date-fns'
import ja from 'date-fns/locale/ja'

interface Offer {
  id: string
  date: string
  message: string
  status: string | null
  respond_deadline: string | null
  event_name?: string | null
  start_time?: string | null
  end_time?: string | null
  reward?: number | null
  remarks?: string | null
  question_allowed?: boolean | null
  user_id?: string
  store_name?: string | null
  store_address?: string | null
  store_logo_url?: string | null
}

export default function TalentOfferDetailPage() {
  const params = useParams<{ id: string }>()
  const supabase = createClient()
  const [offer, setOffer] = useState<Offer | null>(null)

  const handleStatusChange = async (status: 'accepted' | 'rejected') => {
    if (!offer) return
    const res = await fetch(`/api/offers/${offer.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      setOffer({ ...offer, status })
    } else {
      alert('更新に失敗しました')
    }
  }

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('offers')
        .select(
          `id, date, message, status, respond_deadline, event_name, start_time, end_time, reward, remarks, question_allowed, user_id, stores(store_name,address,avatar_url)`,
        )
        .eq('id', params.id)
        .single()

      if (!error && data) {
        const store = (data as any).stores || {}
        const offerData = { ...(data as any) }
        delete offerData.stores
        setOffer({
          ...offerData,
          store_name: store.store_name ?? null,
          store_address: store.address ?? null,
          store_logo_url: store.avatar_url ?? null,
        })
      } else {
        console.error("offer fetch error:", error)
        setOffer(null)
      }
    }
    load()
  }, [params.id, supabase])

  if (!offer) return <p className="p-4">Loading...</p>

  const deadline = offer.respond_deadline || ''
  const deadlinePassed = deadline && isBefore(parseISO(deadline), new Date())
  const timeRange =
    offer.start_time && offer.end_time
      ? `${offer.start_time}〜${offer.end_time}`
      : null

  const statusMap: Record<string, { label: string; className?: string }> = {
    pending: { label: '対応待ち', className: 'bg-yellow-500 text-white' },
    accepted: { label: '承諾済み', className: 'bg-gray-400 text-white' },
    rejected: { label: '辞退済み', className: 'bg-gray-400 text-white' },
  }

  const statusInfo = statusMap[offer.status ?? 'pending']

  return (
    <div className="max-w-screen-md mx-auto p-6 space-y-6 pb-24">
      <Link href="/talent/offers" className="text-sm underline">
        ← オファー一覧へ戻る
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>店舗情報</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {offer.store_logo_url && (
            <div className="w-full flex justify-center">
              <Image
                src={offer.store_logo_url}
                alt="store logo"
                width={200}
                height={120}
                className="object-contain h-24 w-auto"
              />
            </div>
          )}
          {offer.store_name && <div className="text-lg font-bold">{offer.store_name}</div>}
          {offer.store_address && (
            <div className="text-sm text-muted-foreground">{offer.store_address}</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>オファー内容</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <Badge className={statusInfo.className}>{statusInfo.label}</Badge>
          {deadline && (
            <div className={deadlinePassed ? 'text-red-600' : ''}>
              要返信: {format(parseISO(deadline), 'yyyy-MM-dd')}
            </div>
          )}
          {offer.event_name && <div>イベント名: {offer.event_name}</div>}
          <div>
            日付:{' '}
            {format(parseISO(offer.date), 'M月d日(E)', { locale: ja })}
          </div>
          {timeRange && <div>時間帯: {timeRange}</div>}
          {typeof offer.reward === 'number' && (
            <div>報酬: {offer.reward.toLocaleString()}円</div>
          )}
          <div className="whitespace-pre-wrap">{offer.message}</div>
          {offer.remarks && (
            <div className="p-2 bg-muted rounded text-sm whitespace-pre-wrap">
              {offer.remarks}
            </div>
          )}
        </CardContent>
      </Card>

      {offer.question_allowed && (
        <div className="text-right text-sm">
          <Button variant="link" onClick={() => alert('質問機能は未実装です')}>質問する</Button>
        </div>
      )}

      {offer.status === 'pending' && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex gap-4 justify-center">
          <Button
            variant="secondary"
            onClick={() => handleStatusChange('rejected')}
          >
            見送る
          </Button>
          <Button onClick={() => handleStatusChange('accepted')}>承諾する</Button>
        </div>
      )}
    </div>
  )
}
