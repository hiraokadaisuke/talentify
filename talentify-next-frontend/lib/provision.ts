import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

export async function ensureTalentProfile(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<string | null> {
  const { data, error } = await supabase
    .from('talents')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle()

  if (error && error.code !== 'PGRST116') {
    console.error('failed to load talent profile', error)
    return null
  }

  if (!data) {
    const { data: inserted, error: insertError } = await supabase
      .from('talents')
      .insert({ user_id: userId, name: '' })
      .select('id')
      .maybeSingle()

    if (insertError && insertError.code !== '23505') {
      console.error('failed to provision talent profile', insertError)
      return null
    }

    if (!insertError) {
      console.info('provisioned talent profile', { user_id: userId })
    }

    return inserted?.id ?? null
  }

  return data.id
}

export async function ensureStoreProfile(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<string | null> {
  const { data, error } = await supabase
    .from('stores')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle()

  if (error && error.code !== 'PGRST116') {
    console.error('failed to load store profile', error)
    return null
  }

  if (!data) {
    const { data: inserted, error: insertError } = await supabase
      .from('stores')
      .insert({ user_id: userId, store_name: '' })
      .select('id')
      .maybeSingle()

    if (insertError && insertError.code !== '23505') {
      console.error('failed to provision store profile', insertError)
      return null
    }

    if (!insertError) {
      console.info('provisioned store profile', { user_id: userId })
    }

    return inserted?.id ?? null
  }

  return data.id
}
