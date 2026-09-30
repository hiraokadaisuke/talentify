import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { createServiceClient } from '@/lib/supabase/service'

export async function GET() {
  try {
    const { user, error: userError } = await getCurrentUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    const service = createServiceClient()
    const { count, error } = await service
      .from('offer_messages')
      .select('id', { count: 'exact', head: true })
      .eq('receiver_user', user.id)
      .is('read_at', null)

    if (error) throw error
    return NextResponse.json({ count: count ?? 0 })
  } catch (error) {
    console.error('[GET /api/messages/unread-count]', error)
    return NextResponse.json({ count: 0 }, { status: 500 })
  }
}
