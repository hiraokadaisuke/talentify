import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { offerId, receiverUser, body } = await req.json()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (!user || userError) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let senderRole: 'store' | 'talent' | 'admin' = 'admin'
  const { data: store } = await supabase
    .from('stores')
    .select('id')
    .eq('user_id', user.id)
    .single()
  if (store) {
    senderRole = 'store'
  } else {
    const { data: talent } = await supabase
      .from('talents')
      .select('id')
      .eq('user_id', user.id)
      .single()
    senderRole = talent ? 'talent' : 'admin'
  }

  const message: Record<string, unknown> = {
    sender_user: user.id,
    receiver_user: receiverUser,
    sender_role: senderRole,
    body,
  }
  if (offerId) {
    message.offer_id = offerId
  }

  const { data, error } = await supabase
    .from('offer_messages')
    .insert(message)
    .select('*')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}
