'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ListSkeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { format, isBefore, parseISO, addDays } from 'date-fns'

type Offer = {
  id: string
  date: string
  message: string
  status: string | null
  respond_deadline: string | null
}

export default function TalentOffersPage() {
  const supabase = createClient()
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOffers = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('offers' as any)
        .select('id, date, message, status, respond_deadline')
        .eq('talent_id', user.id) // ログイン中タレント宛のみに限定

      if (error) {
        console.error('Error fetching offers:', error)
      } else {
        setOffers(data as any)
      }
      setLoading(false)
    }

    fetchOffers()
  }, [supabase])

  const statusMap: Record<string, { label: string; className?: string }> = {
    pending: { label: '対応待ち', className: 'bg-yellow-500 text-white' },
    accepted: { label: '承諾済み', className: 'bg-gray-400 text-white' },
    rejected: { label: '辞退済み', className: 'bg-gray-400 text-white' },
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold">受信したオファー一覧</h1>
      {loading ? (
        <ListSkeleton count={3} />
      ) : offers.length === 0 ? (
        <EmptyState title="まだオファーがありません" />
      ) : (
        <ul className="space-y-2">
          {offers.map(offer => {
            const deadline =
              offer.respond_deadline ||
              format(addDays(parseISO(offer.date), 3), 'yyyy-MM-dd')
            const isExpired = isBefore(parseISO(deadline), new Date())
            const statusInfo = statusMap[offer.status ?? 'pending']

            return (
              <li key={offer.id}>
                <Card>
                  <CardContent className="space-y-2 p-4">
                    <div className="flex items-center justify-between">
                      <Badge className={statusInfo.className}>{statusInfo.label}</Badge>
                      <span className={isExpired ? 'text-red-600 text-sm' : 'text-sm'}>
                        期限: {deadline}
                      </span>
                    </div>
                    <div className="text-base font-medium">{offer.message}</div>
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="secondary" disabled={offer.status !== 'pending'}>
                        辞退
                      </Button>
                      <Button size="sm" disabled={offer.status !== 'pending'}>
                        承諾
                      </Button>
                      <Link href={`/talent/offers/${offer.id}`} className="text-sm underline ml-2">
                        詳細
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
