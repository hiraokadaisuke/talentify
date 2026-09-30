import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { createServiceClient } from '@/lib/supabase/service'
import { emitNotification } from '@/lib/notifications/emit'
import { authorizeMessageTarget } from '@/lib/messages/server'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { user, error: userError } = await getCurrentUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    const payload = await req.json().catch(() => null)
    if (!payload || typeof payload !== 'object') {
      return NextResponse.json({ error: 'invalid_payload' }, { status: 400 })
    }

    const receiverUserId =
      typeof payload.receiverUserId === 'string'
        ? payload.receiverUserId
        : typeof payload.receiverUser === 'string'
          ? payload.receiverUser
          : ''
    const body = typeof payload.body === 'string' ? payload.body.trim() : ''
    const offerId = typeof payload.offerId === 'string' && payload.offerId ? payload.offerId : null

    if (!receiverUserId || !body) {
      return NextResponse.json(
        { error: 'receiverUserId and body are required' },
        { status: 400 },
      )
    }
    if (body.length > 5000) {
      return NextResponse.json({ error: 'message_too_long' }, { status: 400 })
    }

    const access = await authorizeMessageTarget({
      senderUserId: user.id,
      receiverUserId,
      offerId,
    })
    if (!access.ok) {
      const status = access.reason === 'offer_not_found' ? 404 : 403
      return NextResponse.json({ error: access.reason }, { status })
    }

    const service = createServiceClient()
    const { data: message, error: insertError } = await service
      .from('offer_messages')
      .insert({
        offer_id: offerId,
        sender_user: user.id,
        receiver_user: receiverUserId,
        sender_role: access.sender.role,
        body,
        attachments: [],
      })
      .select('*')
      .single()

    if (insertError || !message) {
      throw insertError ?? new Error('message insert failed')
    }

    try {
      const threadId = offerId ?? [user.id, receiverUserId].sort().join(':')
      await emitNotification({
        recipientUserId: receiverUserId,
        recipientRole: access.receiver.role,
        event: {
          kind: 'message_received',
          actorName: access.sender.name,
          actorId: user.id,
          threadId,
          messageId: message.id,
          offerId,
        },
      })
    } catch (notificationError) {
      console.error('failed to insert message notification', notificationError)
    }

    return NextResponse.json({ data: message }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/messages/send]', error)
    return NextResponse.json({ error: 'message_send_failed' }, { status: 500 })
  }
}
