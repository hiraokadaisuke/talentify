import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { markAllNotificationsRead } from '@/lib/repositories/notifications'

export const runtime = 'nodejs'

export async function PATCH(req: NextRequest) {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    const body = (await req.json().catch(() => ({}))) as { ids?: unknown }
    const ids = Array.isArray(body.ids)
      ? body.ids.filter((id): id is string => typeof id === 'string')
      : undefined

    const updatedCount = await markAllNotificationsRead({ userId: user.id, ids })

    return NextResponse.json({ ok: true, updated: updatedCount })
  } catch (error) {
    console.error('failed to mark all notifications as read', error)
    return NextResponse.json({ error: 'failed to update notifications' }, { status: 500 })
  }
}
