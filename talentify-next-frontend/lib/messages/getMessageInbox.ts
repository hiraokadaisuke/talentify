import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

export type MessageInboxType = 'direct' | 'offer'

export async function getMessageInboxForUser(
  supabase: SupabaseClient<Database>,
  userId: string,
  type: MessageInboxType,
) {
  let query = supabase
    .from('offer_messages')
    .select('*')
    .order('created_at', { ascending: true })

  if (type === 'offer') {
    query = query.not('offer_id', 'is', null)
  } else {
    query = query.is('offer_id', null)
  }

  query = query.or(`sender_user.eq.${userId},receiver_user.eq.${userId}`)

  const { data, error } = await query
  if (error) throw error

  return data ?? []
}
