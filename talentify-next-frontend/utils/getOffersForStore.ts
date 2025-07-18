'use client'

import { createClient } from '@/utils/supabase/client'

const supabase = createClient()

export type Offer = {
  id: string
  user_id: string
  talent_id: string
  message: string
  date: string
  created_at: string | null
  status: string | null
}

export async function getOffersForStore() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return [] as Offer[]

  const { data, error } = await supabase
    .from('offers')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('failed to fetch offers:', error)
    return [] as Offer[]
  }

  return (data ?? []) as Offer[]
}
