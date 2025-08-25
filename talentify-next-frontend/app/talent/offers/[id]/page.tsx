'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/utils/supabase/client'
import OfferHeaderCard from '@/components/offer/OfferHeaderCard'
import OfferChatThread from '@/components/offer/OfferChatThread'

export default function TalentOfferPage() {
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
      if (data && userData.user) {
        setOffer({
          id: data.id,
          status: data.status,
          date: data.date,
          message: data.message,
          performerName: data.talents?.stage_name || '',
          performerAvatarUrl: data.talents?.avatar_url || null,
          storeName: data.stores?.store_name || '',
        })
        try {
          await supabase
            .from('offer_read_receipts')
            .upsert(
              {
                offer_id: data.id,
                user_id: userData.user.id,
                read_at: new Date().toISOString(),
              },
              { onConflict: 'offer_id,user_id' },
            )
        } catch (e) {
          console.debug(e)
        }
      }
    }
    load()
  }, [params.id, supabase])

  if (!offer || !userId) {
    return <p className="p-4">Loading...</p>
  }

  const handleAccept = async () => {
    try {
      const { error } = await supabase
        .from('offers')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString(),
        })
        .eq('id', offer.id)
      if (error) throw error
      setOffer({ ...offer, status: 'accepted' })
    } catch (err: any) {
      toast.error(`承諾に失敗しました: ${err.message}`)
    }
  }

  const handleDecline = async () => {
    try {
      const { error } = await supabase
        .from('offers')
        .update({
          status: 'declined',
          declined_at: new Date().toISOString(),
        })
        .eq('id', offer.id)
      if (error) throw error
      setOffer({ ...offer, status: 'declined' })
    } catch (err: any) {
      toast.error(`辞退に失敗しました: ${err.message}`)
    }
  }

  return (
    <div className="flex flex-col gap-4 h-full p-4">
      <OfferHeaderCard
        offer={offer}
        role="talent"
        onAccept={handleAccept}
        onDecline={handleDecline}
      />
      <div id="chat" className="flex-1 min-h-0">
        <OfferChatThread
          offerId={offer.id}
          currentUserId={userId}
          currentRole="talent"
        />
      </div>
    </div>
  )
}
