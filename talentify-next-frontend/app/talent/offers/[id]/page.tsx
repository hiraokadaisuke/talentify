'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import OfferHeaderCard from '@/components/offer/OfferHeaderCard'
import OfferChatThread from '@/components/offer/OfferChatThread'
import { toast } from 'sonner'

export default function TalentOfferPage() {
  const params = useParams<{ id: string }>()
  const supabase = createClient()
  const [offer, setOffer] = useState<any>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<'accept' | 'decline' | null>(null)

  const loadOffer = useCallback(async () => {
    const { data } = await supabase
      .from('offers')
      .select(
        'id,status,date,message,talent_id,user_id, talents(stage_name,avatar_url), stores(store_name)'
      )
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
  }, [params.id, supabase])

  useEffect(() => {
    const init = async () => {
      const { data: userData } = await supabase.auth.getUser()
      setUserId(userData.user?.id ?? null)
      await loadOffer()
    }
    init()
  }, [loadOffer, supabase])

  if (!offer || !userId) {
    return <p className="p-4">Loading...</p>
  }

  const handleAccept = async () => {
    if (offer.status !== 'pending') return
    setActionLoading('accept')
    setOffer({ ...offer, status: 'confirmed' })
    const { error } = await supabase
      .from('offers')
      .update({ status: 'confirmed' })
      .eq('id', offer.id)
    if (error) {
      toast.error('承諾に失敗しました')
      setOffer(prev => ({ ...prev, status: 'pending' }))
    } else {
      await loadOffer()
    }
    setActionLoading(null)
  }

  const handleDecline = async () => {
    if (offer.status !== 'pending') return
    setActionLoading('decline')
    setOffer({ ...offer, status: 'rejected' })
    const { error } = await supabase
      .from('offers')
      .update({ status: 'rejected' })
      .eq('id', offer.id)
    if (error) {
      toast.error('辞退に失敗しました')
      setOffer(prev => ({ ...prev, status: 'pending' }))
    } else {
      await loadOffer()
    }
    setActionLoading(null)
  }

  return (
    <div className="flex flex-col gap-4 h-full p-4">
      <OfferHeaderCard
        offer={offer}
        role="talent"
        onAccept={handleAccept}
        onDecline={handleDecline}
        actionLoading={actionLoading}
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
