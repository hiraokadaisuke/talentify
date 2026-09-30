import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { emitNotification } from '@/lib/notifications/emit'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { user, error: userError } = await getCurrentUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    const { offerId, reviewId } = await req.json()
    if (!offerId || !reviewId) {
      return NextResponse.json({ error: 'missing fields' }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: offer, error: offerError } = await supabase
      .from('offers')
      .select('store_id, talent_id')
      .eq('id', offerId)
      .single()

    if (offerError || !offer) {
      return NextResponse.json({ error: 'offer_not_found' }, { status: 404 })
    }

    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('id')
      .eq('id', offer.store_id)
      .eq('user_id', user.id)
      .single()

    if (storeError || !store) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 })
    }

    const { data: review, error: reviewError } = await supabase
      .from('reviews')
      .select('id')
      .eq('id', reviewId)
      .eq('offer_id', offerId)
      .single()

    if (reviewError || !review) {
      return NextResponse.json({ error: 'review_not_found' }, { status: 404 })
    }

    const service = createServiceClient()
    const { data: talent, error: talentError } = await service
      .from('talents')
      .select('user_id')
      .eq('id', offer.talent_id)
      .single()

    if (talentError || !talent?.user_id) {
      return NextResponse.json({ error: 'talent_user_not_found' }, { status: 404 })
    }

    await emitNotification({
      recipientUserId: talent.user_id,
      event: {
        kind: 'review_received',
        offerId,
        reviewId,
        actorName: '店舗',
        actorId: user.id,
      },
      recipientRole: 'talent',
    })

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[POST /api/notifications/review-received]', e)
    return NextResponse.json({ error: 'internal_error' }, { status: 500 })
  }
}
