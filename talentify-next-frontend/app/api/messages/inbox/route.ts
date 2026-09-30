import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { createClient } from '@/lib/supabase/server'

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
