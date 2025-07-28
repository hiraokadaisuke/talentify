import { createClient } from './supabase/server'
import type { Database } from '@/types/supabase'

export async function getOffersForStore(userId: string) {
  const supabase = await createClient()

  const { data: store } = await supabase
    .from('stores')
    .select('id')
    .eq('user_id', userId)
    .single()
  if (!store) return [] as Database['public']['Tables']['offers']['Row'][]

  const { data, error } = await supabase
    .from('offers')
    .select('*')
    .eq('store_id', store.id)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data as Database['public']['Tables']['offers']['Row'][]
}

export async function getScheduleForStore(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('schedules')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: true })

  if (error) throw new Error(error.message)
  return data as Database['public']['Tables']['schedules']['Row'][]
}
