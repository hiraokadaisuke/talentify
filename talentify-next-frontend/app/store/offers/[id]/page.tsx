'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import OfferHeaderCard from '@/components/offer/OfferHeaderCard'
import OfferChatThread from '@/components/offer/OfferChatThread'
import OfferCancelButton from '@/components/offers/OfferCancelButton'

export default function StoreOfferPage() {
  const params = useParams<{ id: string }>()
  const supabase = createClient()
  const [offer, setOffer] = useState<any>(null)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      const { data: userData } = await supabase.auth.getUser()
      setUserId(userData.user?.id ?? null)
      const { data } = await supabase
        .from('offers')
        .select('id,status,date,message,talent_id,user_id, talents(stage_name,avatar_url), stores(store_name)')
        .eq('id', params.id)
        .single()
      if (data) {
        setOffer({
          id: data.id,
          status: data.status,
          date: data.date,
          message: data.message,
          performerName: data.talents?.stage_name || '',
          performerAvatarUrl: data.talents?.avatar_url || null,
          storeName: data.stores?.store_name || '',
        })
      }
    }
    load()
  }, [params.id, supabase])

  if (!offer || !userId) {
    return <p className="p-4">Loading...</p>
  }

  return (
    <div className="flex flex-col gap-4 h-full p-4">
      <OfferHeaderCard offer={offer} role="store" />
      <OfferCancelButton offerId={offer.id} currentStatus={offer.status} />
      <div id="chat" className="flex-1 min-h-0">
        <OfferChatThread
          offerId={offer.id}
          currentUserId={userId}
          currentRole="store"
        />
      </div>
    </div>
  )
}
