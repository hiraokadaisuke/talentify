import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { getIdempotentResponse, persistIdempotentResponse } from '@/lib/notification-idempotency'
import { markAllNotificationsRead } from '@/lib/repositories/notifications'

export const runtime = 'nodejs'

export async function PATCH(req: NextRequest) {
  try {
    const { user } = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    const idempotent = await getIdempotentResponse(req, user.id)
    if (idempotent) {
      return idempotent
    }

    const body = (await req.json().catch(() => ({}))) as { ids?: unknown }
    const ids = Array.isArray(body.ids)
      ? body.ids.filter((id): id is string => typeof id === 'string')
      : undefined

    const updatedCount = await markAllNotificationsRead({ userId: user.id, ids })

    const response = NextResponse.json({ ok: true, updated: updatedCount })
    await persistIdempotentResponse(req, user.id, response)
    return response
  } catch (error) {
    console.error('failed to mark all notifications as read', error)
    return NextResponse.json({ error: 'failed to update notifications' }, { status: 500 })
  }
}
