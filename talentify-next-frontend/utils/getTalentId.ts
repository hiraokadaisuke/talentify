'use client'

import { createClient } from '@/utils/supabase/client'

const supabase = createClient()

/**
 * Fetch the talent id for the currently authenticated user.
 * Returns `null` when no authenticated user or talent record exists.
 */
export async function getTalentId(): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('talents')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) {
    console.error('failed to fetch talent id', error)
    return null
  }

  return data?.id ?? null
}
