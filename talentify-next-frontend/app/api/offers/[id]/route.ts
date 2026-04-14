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
    const body = await req.json()

    const { user, error: userError } = await getCurrentUser()
    if (userError || !user) {
      return NextResponse.json<{ error: string }>({ error: '認証が必要です' }, { status: 401 })
    }

    const offerAccess = await findOfferAccessById(id)
    if (!offerAccess) {
      return NextResponse.json<{ error: string }>({ error: 'オファーが見つかりません' }, { status: 404 })
    }

    let allowedFields: string[] = []
    const storeUserId = offerAccess.store_user_id ?? undefined
    const talentUserId = offerAccess.talent_user_id ?? undefined
    if (storeUserId && user.id === storeUserId) {
      allowedFields = ['status', 'contract_url']
    } else if (talentUserId && user.id === talentUserId) {
      allowedFields = [
        'status',
        'agreed',
        'invoice_date',
        'invoice_amount',
        'bank_name',
        'bank_branch',
        'bank_account_number',
        'bank_account_holder',
        'invoice_submitted',
        'invoice_url',
      ]
    } else {
      return NextResponse.json<{ error: string }>({ error: '権限がありません' }, { status: 403 })
    }

    const updates: Record<string, unknown> = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) updates[field] = body[field]
    }

    if (updates.status !== undefined) {
      const normalizedStatus = toDbOfferStatus(String(updates.status))
      if (normalizedStatus) updates.status = normalizedStatus
      else delete updates.status
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json<{ error: string }>({ error: '更新可能な項目がありません' }, { status: 400 })
    }

    await updateOfferById(id, updates)

    const updatedStatus = typeof updates.status === 'string' ? updates.status : null
    const recipientUserId = user.id === storeUserId ? talentUserId : storeUserId
    if (updatedStatus && recipientUserId) {
      try {
        const event =
          updatedStatus === 'accepted'
            ? {
                kind: 'offer_accepted' as const,
                offerId: id,
                actorId: user.id,
              }
            : {
                kind: 'offer_updated' as const,
                offerId: id,
                actorId: user.id,
                status: updatedStatus,
              }

        await emitNotification({ recipientUserId, event })
      } catch (notificationError) {
        console.error('failed to create offer notification', notificationError)
      }
    }

    // Notify performer or store about status change via webhook if configured
    const webhook = process.env.NOTIFICATION_WEBHOOK_URL
    if (webhook) {
      try {
        await fetch(webhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            offerId: id,
            status: updates.status,
            contract_url: updates.contract_url,
            agreed: updates.agreed,
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
