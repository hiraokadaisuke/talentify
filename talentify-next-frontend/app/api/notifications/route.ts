import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  createNotification,
  countUnreadNotificationsByUser,
  findNotificationsByUser,
} from '@/lib/repositories/notifications'
import type { Json } from '@/types/supabase'
import { NOTIFICATION_TYPES, NotificationType } from '@/types/notifications'

export const runtime = 'nodejs'

function isJsonValue(value: unknown): value is Json {
  if (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return true
  }

  if (Array.isArray(value)) {
    return value.every((item) => isJsonValue(item))
  }

  if (typeof value === 'object') {
    return Object.values(value).every((item) => isJsonValue(item))
  }

  return false
}

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    const params = req.nextUrl.searchParams
    const unreadCountOnly = params.get('unread_count') === 'true'

    if (unreadCountOnly) {
      const count = await countUnreadNotificationsByUser({ userId: user.id })
      return NextResponse.json({ count })
    }

    const limitParam = params.get('limit')
    const parsedLimit = limitParam ? Number(limitParam) : undefined
    const limit =
      typeof parsedLimit === 'number' && Number.isFinite(parsedLimit) && parsedLimit > 0
        ? Math.floor(parsedLimit)
        : undefined

    const data = await findNotificationsByUser({ userId: user.id, limit })

    return NextResponse.json({ data })
  } catch (error) {
    console.error('failed to fetch notifications', error)
    return NextResponse.json({ error: 'failed to fetch notifications' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    const { type, payload, title, body } = await req.json()

    if (!type || !title || !NOTIFICATION_TYPES.includes(type as NotificationType)) {
      return NextResponse.json({ error: 'invalid request' }, { status: 400 })
    }

    try {
      const normalizedPayload = payload === undefined ? null : payload
      if (normalizedPayload !== null && !isJsonValue(normalizedPayload)) {
        return NextResponse.json({ error: 'invalid request' }, { status: 400 })
      }

      const data = await createNotification({
        user_id: user.id,
        type,
        title,
        body: body ?? null,
        data: normalizedPayload,
      })

      return NextResponse.json({ data })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'failed to insert notification'
      console.error('failed to insert notification', { user_id: user.id, type, error })
      return NextResponse.json({ error: message }, { status: 400 })
    }
  } catch (error) {
    console.error('failed to insert notification', error)
    return NextResponse.json({ error: 'invalid request' }, { status: 400 })
  }
}
