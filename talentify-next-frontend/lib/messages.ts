import { createClient } from '@/utils/supabase/client'

const supabase = createClient()

export async function findOrCreateConversation(storeUserId: string, talentUserId: string) {
  const { data, error } = await supabase
    .from('offer_messages')
    .select('id')
    .or(
      `and(sender_user.eq.${storeUserId},receiver_user.eq.${talentUserId}),and(sender_user.eq.${talentUserId},receiver_user.eq.${storeUserId})`
    )
    .limit(1)
  if (error) throw error
  return { conversationId: talentUserId, exists: (data?.length ?? 0) > 0 }
}

export async function sendMessage(conversationId: string, body: string) {
  const res = await fetch('/api/messages/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ receiverUser: conversationId, body })
  })
  if (!res.ok) {
    throw new Error('failed to send message')
  }
  return (await res.json()) as { data: { id: string } }
}
