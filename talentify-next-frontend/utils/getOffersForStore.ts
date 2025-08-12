'use client'

import { createClient } from '@/utils/supabase/client'

const supabase = createClient()

export type Offer = {
  id: string
  user_id: string
  store_id: string
  talent_id: string
  message: string
  created_at: string | null
  status: string | null
  paid?: boolean | null
  paid_at?: string | null
  payment_id?: string | null
}

export async function getOffersForStore() {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return [] as Offer[]

  const { data: store } = await supabase
    .from('stores')
    .select('id')
    .eq('user_id', user.id)
    .single()
  if (!store) return [] as Offer[]

  const { data, error } = await supabase
    .from('offers')
    .select(
      'id,user_id,store_id,talent_id,message,created_at,status,payments(id,status,paid_at)'
    )
    .eq('store_id', store.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('failed to fetch offers:', error)
    return [] as Offer[]
  }

  return (data ?? []).map((o: any) => ({
    id: o.id,
    user_id: o.user_id,
    store_id: o.store_id,
    talent_id: o.talent_id,
    message: o.message,
    created_at: o.created_at,
    status: o.status,
    paid: o.payments?.status === 'completed',
    paid_at: o.payments?.paid_at ?? null,
    payment_id: o.payments?.id ?? null,
  })) as Offer[]
}
