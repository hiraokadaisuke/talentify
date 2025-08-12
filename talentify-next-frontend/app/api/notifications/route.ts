import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { NOTIFICATION_TYPES, NotificationType } from '@/types/notifications'

export const runtime = 'nodejs'

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
