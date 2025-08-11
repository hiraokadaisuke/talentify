import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { offerId, reviewId, recipientUserId } = await req.json()

    if (!offerId || !reviewId || !recipientUserId) {
      return NextResponse.json({ error: 'missing fields' }, { status: 400 })
    }

    const supabase = createServiceClient()
    const { error } = await supabase.from('notifications').insert({
      user_id: recipientUserId,
      type: 'review_received',
      data: { offer_id: offerId, review_id: reviewId },
    })
    if (error) return NextResponse.json({ error }, { status: 400 })

    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
