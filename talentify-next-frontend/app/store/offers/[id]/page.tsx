'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { format, parseISO } from 'date-fns'
import { createClient } from '@/utils/supabase/client'
import { Badge } from '@/components/ui/badge'

interface Offer {
  id: string
  created_at?: string | null
  status: string | null
  date: string
  second_date?: string | null
  third_date?: string | null
  time_range?: string | null
  message: string
  notes?: string | null
  reward?: number | null
  event_name?: string | null
  question_allowed?: boolean | null
}

export default function StoreOfferDetailPage() {
  const params = useParams<{ id: string }>()
  const supabase = createClient()
  const [offer, setOffer] = useState<Offer | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setErrorMessage(null)
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setErrorMessage('ログインが必要です')
        return
      }

      const { data: store } = await supabase
        .from('stores')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()
      if (!store) {
        setErrorMessage('店舗ユーザーのみ閲覧できます')
        return
      }

      const { data, error } = await supabase
        .from('offers')
        .select(
          `id, created_at, status, date, second_date, third_date, time_range, message, notes, reward, event_name, question_allowed`
        )
        .eq('id', params.id)
        .eq('store_id', store.id)
        .maybeSingle()

      if (!error && data) {
        setOffer(data as Offer)
      } else {
        console.error('offer fetch error:', error)
        setErrorMessage(error?.message || 'オファー情報を取得できませんでした')
      }
    }
    load()
  }, [params.id, supabase])

  if (errorMessage)
    return <p className="p-4 text-red-600">{errorMessage}</p>
  if (!offer) return <p className="p-4">Loading...</p>

  const statusMap: Record<string, { label: string; className?: string }> = {
    pending: { label: '保留中', className: 'bg-yellow-500 text-white' },
    approved: { label: '承認済み', className: 'bg-gray-400 text-white' },
    rejected: { label: '拒否', className: 'bg-gray-400 text-white' },
    accepted: { label: '承諾済み', className: 'bg-gray-400 text-white' },
  }
  const statusInfo = statusMap[offer.status ?? 'pending'] || statusMap.pending

  return (
    <main className="max-w-screen-md mx-auto p-6 space-y-4">
      <Link href="/store/offers" className="text-sm underline">
        ← オファー一覧へ戻る
      </Link>
      <div className="space-y-2 text-sm">
        <div>オファーID: {offer.id}</div>
        {offer.created_at && (
          <div>作成日: {format(parseISO(offer.created_at), 'yyyy-MM-dd')}</div>
        )}
        <Badge className={statusInfo.className}>{statusInfo.label}</Badge>
        {offer.event_name && <div>イベント名: {offer.event_name}</div>}
        <div>候補日1: {format(parseISO(offer.date), 'yyyy-MM-dd')}</div>
        {offer.second_date && (
          <div>候補日2: {format(parseISO(offer.second_date), 'yyyy-MM-dd')}</div>
        )}
        {offer.third_date && (
          <div>候補日3: {format(parseISO(offer.third_date), 'yyyy-MM-dd')}</div>
        )}
        {offer.time_range && <div>時間帯: {offer.time_range}</div>}
        {typeof offer.reward === 'number' && (
          <div>報酬: {offer.reward.toLocaleString()}円</div>
        )}
        <div className="whitespace-pre-wrap">{offer.message}</div>
        {offer.notes && (
          <div className="p-2 bg-muted rounded whitespace-pre-wrap">{offer.notes}</div>
        )}
        {offer.question_allowed && (
          <div className="text-right">
            <button
              className="text-blue-600 underline"
              onClick={() => alert('質問機能は未実装です')}
            >
              質問する
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
