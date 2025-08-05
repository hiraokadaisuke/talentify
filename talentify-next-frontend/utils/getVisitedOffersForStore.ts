'use client'
import { createClient } from '@/utils/supabase/client'

const supabase = createClient()
export type VisitedOffer = {
  id: string
  talent_id: string
  store_id: string
  date: string
  message: string
  reviewed: boolean
  talent_name: string | null
}

export async function getVisitedOffersForStore() {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return [] as VisitedOffer[]

  const { data: store } = await supabase
    .from('stores')
    .select('id')
    .eq('user_id', user.id)
    .single()
  if (!store) return [] as VisitedOffer[]

  const { data, error } = await supabase
    .from('visits')
    .select(
      'offer_id, talent_id, store_id, offers(id, date, message, reviews(id), talents(stage_name))'
    )
    .eq('store_id', store.id)
    .eq('status', 'visited')

  if (error) {
    console.error('failed to fetch visited offers', error)
    return []
  }

  return (data || []).map(v => ({
    id: (v as any).offer_id,
    talent_id: v.talent_id,
    store_id: v.store_id,
    date: (v as any).offers?.date as string,
    message: (v as any).offers?.message as string,
    reviewed: !!(v as any).offers?.reviews?.length,
    talent_name: (v as any).offers?.talents?.stage_name || null,
  })) as VisitedOffer[]
}
