'use client'

import { createClient } from '@/utils/supabase/client'

const supabase = createClient()

export type TalentOffer = {
  id: string
  store_id: string
  store_name: string | null
  created_at: string | null
  date: string | null
  status: string | null
  paid?: boolean | null
}

export async function getOffersForTalent() {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return [] as TalentOffer[]

  const { data: talent } = await supabase
    .from('talents')
    .select('id')
    .eq('user_id', user.id)
    .single()
  if (!talent) return [] as TalentOffer[]

  const { data, error } = await supabase
    .from('offers')
    .select('id, store_id, created_at, date, status, payments(status,paid_at), store:store_id(store_name)')
    .eq('talent_id', talent.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('failed to fetch offers for talent:', error)
    return [] as TalentOffer[]
  }

  return (data ?? []).map((o: any) => ({
    id: o.id,
    store_id: o.store_id,
    store_name: o.store?.store_name ?? null,
    created_at: o.created_at,
    date: o.date,
    status: o.status,
    paid: o.payments?.status === 'completed',
  })) as TalentOffer[]
}
