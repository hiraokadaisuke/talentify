import { createClient } from '@/utils/supabase/client'

const supabase = createClient()

export async function findOrCreateConversation(storeUserId: string, talentUserId: string) {
  const { data, error } = await supabase
    .from('messages')
    .select('id')
    .or(`and(sender_id.eq.${storeUserId},topic.eq.${talentUserId}),and(sender_id.eq.${talentUserId},topic.eq.${storeUserId})`)
    .limit(1)
  if (error) throw error
  return { conversationId: talentUserId, exists: (data?.length ?? 0) > 0 }
}

export async function sendMessage(conversationId: string, body: string) {
  const res = await fetch('/api/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic: conversationId, content: body })
  })
  if (!res.ok) {
    throw new Error('failed to send message')
  }
  return (await res.json()) as { id: string }
}
