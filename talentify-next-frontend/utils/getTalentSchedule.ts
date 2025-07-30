export type TalentSchedule = {
  id: string
  store_name: string | null
  fixed_date: string
  time_range: string | null
}

import { createClient } from '@/utils/supabase/client'

/**
 * Fetch confirmed schedules for the current talent user
 */
export async function getTalentSchedule(): Promise<TalentSchedule[]> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  const { data, error } = await supabase
    .from('offers')
    .select('id, fixed_date, time_range, stores(store_name)')
    .eq('talent_id', user.id)
    .eq('status', 'confirmed')
    .not('fixed_date', 'is', null)
    .order('fixed_date', { ascending: true })

  if (error) {
    console.error('failed to fetch schedules', error)
    return []
  }

  return (
    data ?? []
  ).map((o: any) => ({
    id: o.id,
    fixed_date: o.fixed_date,
    time_range: o.time_range,
    store_name: o.stores?.store_name ?? null,
  }))
}
