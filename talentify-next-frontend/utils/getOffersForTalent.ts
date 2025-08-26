'use client'

import { z } from 'zod'
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

const offerRowSchema = z.object({
  id: z.string(),
  store_id: z.string(),
  created_at: z.string().nullable(),
  date: z.string().nullable(),
  status: z.string().nullable(),
  payments: z
    .array(
      z.object({ status: z.string().nullable(), paid_at: z.string().nullable() })
    )
    .nullable(),
  store: z
    .object({
      id: z.string(),
      store_name: z.string().nullable(),
      is_setup_complete: z.boolean().nullable(),
    })
    .nullable(),
})

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
    .select(
      'id, store_id, created_at, date, status, payments(status,paid_at), store:store_id(id, store_name, is_setup_complete)'
    )
    .eq('talent_id', talent.id)
    .or('and(status.eq.canceled,accepted_at.not.is.null),status.neq.canceled')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('failed to fetch offers for talent:', error)
    throw error
  }

  const parsed = offerRowSchema.array().safeParse(data ?? [])
  if (!parsed.success) {
    console.error('invalid data shape:', parsed.error)
    return [] as TalentOffer[]
  }

  return parsed.data.map(o => ({
    id: o.id,
    store_id: o.store_id,
    store_name: o.store?.store_name ?? null,
    created_at: o.created_at,
    date: o.date,
    status: o.status,
    paid: o.payments?.[0]?.status === 'completed',
  })) as TalentOffer[]
}
