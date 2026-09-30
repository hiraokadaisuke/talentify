import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const { user, error: userError } = await getCurrentUser()
  if (userError || !user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const threadId = req.nextUrl.searchParams.get('threadId')
  const type = req.nextUrl.searchParams.get('type') === 'offer' ? 'offer' : 'direct'
  if (!threadId) {
    return NextResponse.json({ error: 'threadId is required' }, { status: 400 })
  }

  const supabase = await createClient()
  let query = supabase
    .from('offer_messages')
    .select('*')
    .order('created_at', { ascending: true })
    .limit(200)

  if (type === 'offer') {
    query = query.eq('offer_id', threadId)
  } else {
    query = query
      .is('offer_id', null)
      .or(
        `and(sender_user.eq.${user.id},receiver_user.eq.${threadId}),and(sender_user.eq.${threadId},receiver_user.eq.${user.id})`
      )
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data: data ?? [], nextCursor: null })
}
