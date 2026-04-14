import { NextRequest, NextResponse } from 'next/server'
import { createActionableNotification } from '@/lib/notifications/service'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { offerId, reviewId, recipientUserId } = await req.json()

    if (!offerId || !reviewId || !recipientUserId) {
      return NextResponse.json({ error: 'missing fields' }, { status: 400 })
    }

    await createActionableNotification(
      recipientUserId,
      { kind: 'review_received', offerId, reviewId, actorName: '店舗' },
      'talent',
    )

    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
