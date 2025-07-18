'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { format, isBefore, parseISO } from 'date-fns'

interface Offer {
  id: string
  date: string
  message: string
  status: string | null
  respond_deadline: string | null
  user_id?: string
  store_name?: string | null
}

export default function TalentOfferDetailPage() {
  const params = useParams<{ id: string }>()
  const supabase = createClient()
  const [offer, setOffer] = useState<Offer | null>(null)

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('offers')
        .select('id, date, message, status, respond_deadline, user_id')
        .eq('id', params.id)
        .single()

      if (data) {
        const { data: store } = await supabase
          .from('stores')
          .select('display_name')
          .eq('user_id', data.user_id)
          .single()
        setOffer({ ...data, store_name: store?.display_name })
      }
    }
    load()
  }, [params.id, supabase])

  if (!offer) return <p className="p-4">Loading...</p>

  const deadline = offer.respond_deadline || ''
  const deadlinePassed = deadline && isBefore(parseISO(deadline), new Date())

  const statusMap: Record<string, { label: string; className?: string }> = {
    pending: { label: '対応待ち', className: 'bg-yellow-500 text-white' },
    accepted: { label: '承諾済み', className: 'bg-gray-400 text-white' },
    rejected: { label: '辞退済み', className: 'bg-gray-400 text-white' },
  }

  const statusInfo = statusMap[offer.status ?? 'pending']

  return (
    <div className="max-w-screen-md mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>オファー詳細</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <Badge className={statusInfo.className}>{statusInfo.label}</Badge>
          {deadline && (
            <div className={deadlinePassed ? 'text-red-600' : ''}>
              対応期限: {format(parseISO(deadline), 'yyyy-MM-dd')}
            </div>
          )}
          {offer.store_name && <div>店舗名: {offer.store_name}</div>}
          <div>希望日: {offer.date}</div>
          <div className="whitespace-pre-wrap">{offer.message}</div>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button disabled>辞退</Button>
          <Button>承諾</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>この近辺の予定</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          近日のスケジュール表示（予定）
        </CardContent>
      </Card>
    </div>
  )
}
