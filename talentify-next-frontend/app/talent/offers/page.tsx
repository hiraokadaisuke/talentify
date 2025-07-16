'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

type Offer = {
  id: string
  date: string
  message: string
  status: string
}

export default function TalentOffersPage() {
  const supabase = createClient()
  const [offers, setOffers] = useState<Offer[]>([])

  useEffect(() => {
    const fetchOffers = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('offers')
        .select('id, date, message, status')
        .eq('talent_id', user.id) // ログイン中タレント宛のみに限定

      if (error) {
        console.error('Error fetching offers:', error)
      } else {
        setOffers(data)
      }
    }

    fetchOffers()
  }, [supabase])

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold">受信したオファー一覧</h1>
      {offers.length === 0 ? (
        <p>現在オファーはありません。</p>
      ) : (
        <ul className="space-y-2">
          {offers.map((offer) => (
            <li key={offer.id} className="p-4 border rounded-lg">
              <div className="text-sm text-gray-500">日付: {offer.date}</div>
              <div className="text-base font-medium mt-1">{offer.message}</div>
              <div className="text-sm mt-2">
                ステータス: <span className="font-semibold">{offer.status}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
