import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import {
  countUnreadNotificationsByUser,
  findNotificationsByUser,
} from '@/lib/repositories/notifications'
import { NOTIFICATION_TYPES, NotificationType } from '@/types/notifications'

export const runtime = 'nodejs'

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
    const { user_id, type, payload, title, body } = await req.json()

    if (!user_id || !type || !title || !NOTIFICATION_TYPES.includes(type as NotificationType)) {
      return NextResponse.json({ error: 'invalid request' }, { status: 400 })
    }

    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id,
        type,
        title,
        body: body ?? null,
        data: payload ?? null,
      })
      .select()
      .single()

    if (error) {
      console.error('failed to insert notification', { user_id, type, error })
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('failed to insert notification', error)
    return NextResponse.json({ error: 'invalid request' }, { status: 400 })
  }
}
