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
  second_date?: string | null
  third_date?: string | null
  time_range?: string | null
  created_at?: string | null
  message: string
  status: string | null
  respond_deadline: string | null
  event_name?: string | null
  start_time?: string | null
  end_time?: string | null
  reward?: number | null
  notes?: string | null
  question_allowed?: boolean | null
  agreed?: boolean | null
  user_id?: string
  store_name?: string | null
  store_address?: string | null
  store_logo_url?: string | null
}

export default function TalentOfferDetailPage() {
  const params = useParams<{ id: string }>()
  const supabase = createClient()
  const [offer, setOffer] = useState<Offer | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const handleStatusChange = async (status: 'accepted' | 'rejected') => {
    if (!offer) return
    const res = await fetch(`/api/offers/${offer.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      setOffer({ ...offer, status })
      setToast(status === 'accepted' ? 'オファーを承諾しました' : 'オファーを辞退しました')
      setTimeout(() => setToast(null), 3000)
    } else {
      setToast('処理に失敗しました。もう一度お試しください')
      setTimeout(() => setToast(null), 3000)
    }
  }

  useEffect(() => {
    const load = async () => {
      setErrorMessage(null)
      const { data, error } = await supabase
        .from('offers')
        .select(
  `id, date, second_date, third_date, time_range, created_at, message, status, respond_deadline, event_name, start_time, end_time, reward, notes, question_allowed, agreed, user_id, store:store_id(store_name,store_address,avatar_url)`
)
        .eq('id', params.id)
        .single()

      if (!error && data) {
        const store = (data as any).store || {}
        const offerData = { ...(data as any) }
        delete offerData.store
        setOffer({
          ...offerData,
          store_name: store.store_name ?? null,
          store_address: store.store_address ?? null,
          store_logo_url: store.avatar_url ?? null,
        })
      } else {
        console.error('offer fetch error:', error)
        setOffer(null)
        setErrorMessage(error?.message || 'オファー情報を取得できませんでした')
      }
    }
    load()
  }, [params.id, supabase])

  if (errorMessage)
    return <p className="p-4 text-red-600">{errorMessage}</p>
  if (!offer) return <p className="p-4">Loading...</p>

  const deadline = offer.respond_deadline || ''
  const deadlinePassed = deadline && isBefore(parseISO(deadline), new Date())
  const timeRange =
    offer.time_range ??
    (offer.start_time && offer.end_time
      ? `${offer.start_time}〜${offer.end_time}`
      : null)

  const statusMap: Record<string, { label: string; className?: string }> = {
    pending: { label: '対応待ち', className: 'bg-yellow-500 text-white' },
    accepted: { label: '承諾済', className: 'bg-green-600 text-white' },
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
          <div>オファーID: {offer.id}</div>
          {offer.created_at && (
            <div>作成日: {format(parseISO(offer.created_at), 'yyyy-MM-dd')}</div>
          )}
          <Badge className={statusInfo.className}>{statusInfo.label}</Badge>
          {deadline && (
            <div className={deadlinePassed ? 'text-red-600' : ''}>
              要返信: {format(parseISO(deadline), 'yyyy-MM-dd')}
            </div>
          )}
          {offer.event_name && <div>イベント名: {offer.event_name}</div>}
          <div>候補日1: {format(parseISO(offer.date), 'yyyy-MM-dd')}</div>
          {offer.second_date && (
            <div>候補日2: {format(parseISO(offer.second_date), 'yyyy-MM-dd')}</div>
          )}
          {offer.third_date && (
            <div>候補日3: {format(parseISO(offer.third_date), 'yyyy-MM-dd')}</div>
          )}
          {timeRange && <div>時間帯: {timeRange}</div>}
          {typeof offer.reward === 'number' && (
            <div>報酬: {offer.reward.toLocaleString()}円</div>
          )}
          <div className="whitespace-pre-wrap">{offer.message}</div>
          {offer.notes && (
            <div className="p-2 bg-muted rounded text-sm whitespace-pre-wrap">
              {offer.notes}
            </div>
          )}
          {offer.agreed !== undefined && (
            <div>同意: {offer.agreed ? '済' : '未'}</div>
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

      {offer.status === 'accepted' && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 text-center text-sm">
          確定待ちです
        </div>
      )}

      {toast && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded shadow">
          {toast}
        </div>
      )}
    </div>
  )
}
