import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const { user, error: userError } = await getCurrentUser()
  if (userError || !user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const type = req.nextUrl.searchParams.get('type')
  const supabase = await createClient()
  let query = supabase
    .from('offer_messages')
    .select('id,offer_id,sender_user,receiver_user,created_at,read_at')
    .or(`sender_user.eq.${user.id},receiver_user.eq.${user.id}`)
    .order('created_at', { ascending: false })
    .limit(500)

  if (type === 'offer') query = query.not('offer_id', 'is', null)
  if (type === 'direct') query = query.is('offer_id', null)

  const { data, error } = await query
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const grouped = new Map<string, {
    id: string
    type: 'direct' | 'offer'
    offerId: string | null
    partnerId: string | null
    last_message_at: string
    unreadCount: number
  }>()

  for (const message of data ?? []) {
    const isOffer = Boolean(message.offer_id)
    const partnerId = message.sender_user === user.id ? message.receiver_user : message.sender_user
    const key = isOffer ? `offer:${message.offer_id}` : `direct:${partnerId}`

    if (!grouped.has(key)) {
      grouped.set(key, {
        id: isOffer ? message.offer_id! : partnerId!,
        type: isOffer ? 'offer' : 'direct',
        offerId: message.offer_id,
        partnerId,
        last_message_at: message.created_at,
        unreadCount: 0,
      })
    }

    const thread = grouped.get(key)!
    if (message.receiver_user === user.id && !message.read_at) {
      thread.unreadCount += 1
    }
  }

  return NextResponse.json({ data: Array.from(grouped.values()) })
}
