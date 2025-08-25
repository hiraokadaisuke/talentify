import type { SupabaseClient, RealtimeChannel } from '@supabase/supabase-js'

export type Attachment = {
  path: string
  name: string
  type: string
  size: number
}

export type OfferMessage = {
  id: string
  offer_id: string
  sender_user: string
  sender_role: 'store' | 'talent' | 'admin'
  body: string | null
  attachments: Attachment[]
  created_at: string
}

export async function listOfferMessages(
  client: SupabaseClient,
  offerId: string,
  opts?: { before?: string; limit?: number }
): Promise<{ data: OfferMessage[] }> {
  const limit = opts?.limit ?? 50
  let query = client
    .from('offer_messages')
    .select('*')
    .eq('offer_id', offerId)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (opts?.before) query = query.lt('created_at', opts.before)
  const { data, error } = await query
  if (error) throw error
  return { data: (data as any) as OfferMessage[] }
}

export async function sendOfferMessage(
  client: SupabaseClient,
  params: {
    offerId: string
    senderRole: 'store' | 'talent' | 'admin'
    body: string | null
    attachments: Attachment[]
  }
): Promise<OfferMessage> {
  const {
    data: { user },
  } = await client.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { data, error } = await client
    .from('offer_messages')
    .insert({
      offer_id: params.offerId,
      sender_user: user.id,
      sender_role: params.senderRole,
      body: params.body,
      attachments: params.attachments,
    })
    .select('*')
    .single()
  if (error) throw error
  return data as OfferMessage
}

export function subscribeOfferMessages(
  client: SupabaseClient,
  offerId: string,
  callback: (msg: OfferMessage) => void
): RealtimeChannel {
  const channel = client
    .channel(`offer_messages:${offerId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'offer_messages', filter: `offer_id=eq.${offerId}` },
      payload => {
        callback(payload.new as OfferMessage)
      }
    )
    .subscribe()
  return channel
}

export async function upsertReadReceipt(client: SupabaseClient, offerId: string) {
  const {
    data: { user },
  } = await client.auth.getUser()
  if (!user) return
  await client
    .from('offer_read_receipts')
    .upsert(
      {
        offer_id: offerId,
        user_id: user.id,
        read_at: new Date().toISOString(),
      },
      { onConflict: 'offer_id,user_id' },
    )
    .catch(console.debug)
}

export async function getReadReceipts(client: SupabaseClient, offerId: string) {
  const { data, error } = await client
    .from('offer_read_receipts')
    .select('user_id,read_at')
    .eq('offer_id', offerId)
  if (error) throw error
  return data as { user_id: string; read_at: string }[]
}
