export type TalentSchedule = {
  id: string
  store_name: string | null
  date: string
  time_range: string | null
}

import { createClient } from '@/utils/supabase/client'
import { getTalentId } from './getTalentId'
import { toDbOfferStatus } from '@/app/lib/offerStatus'

/**
 * Fetch confirmed schedules for the current talent user
 */
export async function getTalentSchedule(): Promise<TalentSchedule[]> {
  const supabase = createClient()
  const talentId = await getTalentId()
  if (!talentId) return []

  const confirmedStatus = toDbOfferStatus('confirmed') ?? 'confirmed'

  const { data, error } = await supabase
    .from('offers')
    .select(
      `
      id, date, time_range,
      store:stores!offers_store_id_fkey(id, store_name)
    `
    )
    .eq('talent_id', talentId)
    .eq('status', confirmedStatus)
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
    store_name: o.store?.store_name ?? null,
  }))
}
