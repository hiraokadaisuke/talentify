'use client'
import { createClient } from '@/utils/supabase/client'

const supabase = createClient()
export type VisitedOffer = {
  id: string
  talent_id: string
  store_id: string
  visit_date: string
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
    .from('offers')
    .select('id, talent_id, store_id, visit_date, message, reviews(id), talents(stage_name)')
    .eq('store_id', store.id)
    .eq('status', 'visited')
  if (error) {
    console.error('failed to fetch visited offers', error)
    return []
  }
  return (data || []).map(o => ({
    id: o.id,
    talent_id: o.talent_id,
    store_id: o.store_id,
    visit_date: o.visit_date,
    message: o.message,
    reviewed: !!(o as any).reviews?.length,
    talent_name: (o as any).talents?.stage_name || null,
  })) as VisitedOffer[]
}
