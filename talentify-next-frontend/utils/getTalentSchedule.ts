export type TalentSchedule = {
  id: string
  store_name: string | null
  date: string
  time_range: string | null
}

import { createClient } from '@/utils/supabase/client'
import { getTalentId } from './getTalentId'

/**
 * Fetch confirmed schedules for the current talent user
 */
export async function getTalentSchedule(): Promise<TalentSchedule[]> {
  const supabase = createClient()
  const talentId = await getTalentId()
  if (!talentId) return []

  const { data, error } = await supabase
    .from('offers')
    .select('id, date, time_range, stores(store_name)')
    .eq('talent_id', talentId)
    .eq('status', 'confirmed')
    .order('date', { ascending: true })

  if (error) {
    console.error('failed to fetch schedules', error)
    return []
  }

  return (
    data ?? []
  ).map((o: any) => ({
    id: o.id,
    date: o.date,
    time_range: o.time_range,
    store_name: o.stores?.store_name ?? null,
  }))
}
