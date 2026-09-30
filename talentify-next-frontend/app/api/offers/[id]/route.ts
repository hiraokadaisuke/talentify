import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { toDbOfferStatus } from '@/app/lib/offerStatus'
import { findOfferAccessById, findOfferByIdForAuthUser, updateOfferById } from '@/lib/repositories/offers'
import { emitNotification } from '@/lib/notifications/emit'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const { user, error: userError } = await getCurrentUser()

    if (userError || !user) {
      return NextResponse.json<{ error: string }>({ error: '認証が必要です' }, { status: 401 })
    }

    const offer = await findOfferByIdForAuthUser({ offerId: id, userId: user.id })

    if (!offer) {
      // 認可外か未存在かを区別せず 404 を返し、オファー存在有無の情報漏えいを防ぐ。
      return NextResponse.json<{ error: string }>({ error: 'オファーが見つかりません' }, { status: 404 })
    }

    return NextResponse.json({ data: offer }, { status: 200 })
  } catch (e) {
    console.error('[GET /offers/:id]', e)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await req.json().catch(() => null)

    const { user, error: userError } = await getCurrentUser()
    if (userError || !user) {
      return NextResponse.json<{ error: string }>({ error: '認証が必要です' }, { status: 401 })
    }

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json<{ error: string }>({ error: 'リクエスト形式が正しくありません' }, { status: 400 })
    }

    const requestedStatus = toDbOfferStatus(
      typeof body.status === 'string' ? body.status : null
    )
    if (!requestedStatus) {
      return NextResponse.json<{ error: string }>({ error: '有効なステータスを指定してください' }, { status: 400 })
    }

    const extraFields = Object.keys(body).filter(field => field !== 'status')
    if (extraFields.length > 0) {
      return NextResponse.json<{ error: string }>({ error: 'このAPIではステータスのみ更新できます' }, { status: 400 })
    }

    const offerAccess = await findOfferAccessById(id)
    if (!offerAccess) {
      return NextResponse.json<{ error: string }>({ error: 'オファーが見つかりません' }, { status: 404 })
    }

    const storeUserId = offerAccess.store_user_id ?? undefined
    const talentUserId = offerAccess.talent_user_id ?? undefined
    const currentStatus = offerAccess.status

    let actorRole: 'store' | 'talent'
    let transitionAllowed = false

    if (storeUserId && user.id === storeUserId) {
      actorRole = 'store'
      transitionAllowed =
        requestedStatus === 'canceled' &&
        (currentStatus === 'pending' || currentStatus === 'confirmed')
    } else if (talentUserId && user.id === talentUserId) {
      actorRole = 'talent'
      transitionAllowed =
        currentStatus === 'pending' &&
        requestedStatus === 'rejected'
    } else {
      return NextResponse.json<{ error: string }>({ error: '権限がありません' }, { status: 403 })
    }

    if (!transitionAllowed) {
      return NextResponse.json<{ error: string }>(
        { error: '現在の状態ではこの操作はできません' },
        { status: 409 }
      )
    }

    const updates: Record<string, unknown> = { status: requestedStatus }
    const now = new Date().toISOString()

    if (requestedStatus === 'canceled') {
      updates.canceled_at = now
      updates.canceled_by_role = actorRole
    }

    const updatedCount = await updateOfferById(id, updates, currentStatus)
    if (updatedCount !== 1) {
      return NextResponse.json<{ error: string }>(
        { error: 'オファーの状態が変更されています。画面を更新してください' },
        { status: 409 }
      )
    }

    const recipientUserId = actorRole === 'store' ? talentUserId : storeUserId
    if (recipientUserId) {
      try {
        const event =
          requestedStatus === 'confirmed'
            ? {
                kind: 'offer_accepted' as const,
                offerId: id,
                actorId: user.id,
              }
            : {
                kind: 'offer_updated' as const,
                offerId: id,
                actorId: user.id,
                status: requestedStatus,
              }

        await emitNotification({ recipientUserId, event })
      } catch (notificationError) {
        console.error('failed to create offer notification', notificationError)
      }
    }

    const webhook = process.env.NOTIFICATION_WEBHOOK_URL
    if (webhook) {
      try {
        await fetch(webhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            offerId: id,
            status: requestedStatus,
          }),
        })
      } catch (err) {
        console.error('Failed to send notification:', err)
      }
    }

    return NextResponse.json<{ message: string }>({ message: '更新しました' }, { status: 200 })
  } catch (e) {
    console.error('[PUT /offers/:id]', e)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
