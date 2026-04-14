import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { getIdempotentResponse, persistIdempotentResponse } from '@/lib/notification-idempotency'
import {
  findNotificationOwner,
  markNotificationRead,
  markNotificationUnread,
} from '@/lib/repositories/notifications'

export const runtime = 'nodejs'

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const { user } = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    const idempotent = await getIdempotentResponse(req, user.id)
    if (idempotent) {
      return idempotent
    }

    const { id } = await context.params
    if (!id) {
      return NextResponse.json({ error: 'invalid request' }, { status: 400 })
    }

    const body = (await req.json().catch(() => ({}))) as { is_read?: unknown }
    const isRead = body.is_read

    if (typeof isRead !== 'boolean') {
      return NextResponse.json({ error: 'is_read must be boolean' }, { status: 400 })
    }

    const updatedCount = isRead
      ? await markNotificationRead({ id, userId: user.id })
      : await markNotificationUnread({ id, userId: user.id })

    if (updatedCount === 0) {
      const exists = await findNotificationOwner({ id, userId: user.id })
      if (exists) {
        const response = NextResponse.json({ ok: true, updated: 0, noop: true })
        await persistIdempotentResponse(req, user.id, response)
        return response
      }
      return NextResponse.json({ error: 'notification not found' }, { status: 404 })
    }

    const response = NextResponse.json({ ok: true, updated: updatedCount, noop: false })
    await persistIdempotentResponse(req, user.id, response)
    return response
  } catch (error) {
    console.error('failed to update notification read state', error)
    return NextResponse.json({ error: 'failed to update notification' }, { status: 500 })
  }
}
