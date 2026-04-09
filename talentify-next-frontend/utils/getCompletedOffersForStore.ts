'use client'
import { getCurrentUserWithClient } from '@/lib/auth/getCurrentUserWithClient'
import { createClient } from '@/utils/supabase/client'
import { toDbOfferStatus } from '@/app/lib/offerStatus'

const supabase = createClient()
export type CompletedOffer = {
  id: string
  talent_id: string
  store_id: string
  date: string
  message: string
  reviewed: boolean
  talent_name: string | null
}

type RawCompletedOffer = {
  id: string
  talent_id: string
  store_id: string
  date: string
  message: string
  reviews: { id: string }[] | null
  talents: { stage_name: string | null } | null
}

export async function getCompletedOffersForStore() {
  const { user } = await getCurrentUserWithClient(supabase)
  if (!user) return [] as CompletedOffer[]

  const { data: store } = await supabase
    .from('stores')
    .select('id')
    .eq('user_id', user.id)
    .single()
  if (!store) return [] as CompletedOffer[]

  const completedStatus = toDbOfferStatus('completed') ?? 'completed'

  const { data, error } = await supabase
    .from('offers')
    .select('id, talent_id, store_id, date, message, reviews(id), talents(stage_name)')
    .eq('store_id', store.id)
    .eq('status', completedStatus)
  if (error) {
    console.error('failed to fetch completed offers', error)
    return []
  }
  const offers = (data || []) as unknown as RawCompletedOffer[]
  return offers.map(o => ({
    id: o.id,
    talent_id: o.talent_id,
    store_id: o.store_id,
    date: o.date,
    message: o.message,
    reviewed: !!o.reviews?.length,
    talent_name: o.talents?.stage_name || null,
  })) as CompletedOffer[]
}
