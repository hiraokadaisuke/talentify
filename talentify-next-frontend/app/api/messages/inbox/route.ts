import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { createClient } from '@/lib/supabase/server'

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { user, error: userError } = await getCurrentUser()
  if (!user || userError) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const offerId = searchParams.get('offerId')
  const withUser = searchParams.get('userId')
  const type = searchParams.get('type')

  if (
    (offerId && !UUID_PATTERN.test(offerId)) ||
    (withUser && !UUID_PATTERN.test(withUser)) ||
    (type !== null && type !== 'offer' && type !== 'direct')
  ) {
    return NextResponse.json({ error: 'invalid_query' }, { status: 400 })
  }

  let query = supabase
    .from('offer_messages')
    .select('*')
    .order('created_at', { ascending: true })

  if (offerId) {
    query = query.eq('offer_id', offerId)
  } else if (type === 'offer') {
    query = query.not('offer_id', 'is', null)
  } else if (type === 'direct') {
    query = query.is('offer_id', null)
  }

  if (withUser) {
    query = query.or(
      `and(sender_user.eq.${user.id},receiver_user.eq.${withUser}),and(sender_user.eq.${withUser},receiver_user.eq.${user.id})`
    )
  } else {
    query = query.or(`sender_user.eq.${user.id},receiver_user.eq.${user.id}`)
  }

  const { data, error } = await query
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}
