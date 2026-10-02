import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { createServiceClient } from '@/lib/supabase/service'

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function POST(req: NextRequest) {
  try {
    const { user, error: userError } = await getCurrentUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
    const offerId = typeof body.offerId === 'string' && body.offerId ? body.offerId : null
    const withUser = typeof body.withUser === 'string' && body.withUser ? body.withUser : null

    if (!offerId && !withUser) {
      return NextResponse.json({ error: 'offerId or withUser is required' }, { status: 400 })
    }
    if (
      (offerId && !UUID_PATTERN.test(offerId)) ||
      (withUser && !UUID_PATTERN.test(withUser))
    ) {
      return NextResponse.json({ error: 'invalid_target' }, { status: 400 })
    }

    const service = createServiceClient()
    const readAt = new Date().toISOString()
    let query = service
      .from('offer_messages')
      .update({ read_at: readAt })
      .eq('receiver_user', user.id)
      .is('read_at', null)

    if (offerId) {
      query = query.eq('offer_id', offerId)
    } else {
      query = query.is('offer_id', null).eq('sender_user', withUser!)
    }

    const { data: updatedRows, error: updateError } = await query.select('id')
    if (updateError) throw updateError

    const ids = (updatedRows ?? []).map(row => row.id)
    if (ids.length === 0) {
      return NextResponse.json({ ok: true, count: 0 })
    }

    const { error: notificationError } = await service
      .from('notifications')
      .update({ is_read: true, read_at: readAt, updated_at: readAt })
      .eq('user_id', user.id)
      .eq('type', 'message')
      .eq('is_read', false)
      .in('entity_id', ids)

    if (notificationError) {
      console.error('failed to mark message notifications read', notificationError)
    }

    return NextResponse.json({ ok: true, count: ids.length, read_at: readAt })
  } catch (error) {
    console.error('[POST /api/messages/read]', error)
    return NextResponse.json({ error: 'mark_read_failed' }, { status: 500 })
  }
}
