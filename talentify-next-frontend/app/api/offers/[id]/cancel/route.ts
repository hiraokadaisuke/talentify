import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { getPrismaClient } from '@/lib/prisma'
import { emitNotification } from '@/lib/notifications/emit'

type CancelPayload = {
  reason?: unknown
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = (await req.json().catch(() => null)) as CancelPayload | null
    const reason = typeof body?.reason === 'string' ? body.reason.trim() : ''

    if (reason.length < 5 || reason.length > 1000) {
      return NextResponse.json(
        { error: 'キャンセル理由は5文字以上1000文字以内で入力してください' },
        { status: 400 }
      )
    }

    const { user, error: userError } = await getCurrentUser()
    if (userError || !user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const prisma = getPrismaClient()
    const now = new Date()

    const result = await prisma.$transaction(async tx => {
      const offer = await tx.offers.findUnique({
        where: { id: params.id },
        select: {
          id: true,
          status: true,
          paid: true,
          visit_completed_at: true,
          stores: { select: { user_id: true } },
          talents: { select: { user_id: true } },
          invoices: { select: { id: true, status: true } },
        },
      })

      if (!offer) throw new Error('OFFER_NOT_FOUND')

      const storeUserId = offer.stores?.user_id ?? null
      const talentUserId = offer.talents?.user_id ?? null

      let actorRole: 'store' | 'talent'
      let recipientUserId: string | null

      if (storeUserId === user.id) {
        actorRole = 'store'
        recipientUserId = talentUserId
      } else if (talentUserId === user.id) {
        actorRole = 'talent'
        recipientUserId = storeUserId
      } else {
        throw new Error('FORBIDDEN')
      }

      if (offer.paid || offer.visit_completed_at) {
        throw new Error('OFFER_ALREADY_PERFORMED')
      }

      let cancellationPhase: 'pre_contract' | 'post_contract'
      if (offer.status === 'pending') {
        if (actorRole !== 'store') {
          throw new Error('USE_DECLINE_FOR_PENDING')
        }
        cancellationPhase = 'pre_contract'
      } else if (offer.status === 'confirmed') {
        cancellationPhase = 'post_contract'
        if (offer.invoices?.status !== 'approved') {
          throw new Error('CONTRACT_STATE_INVALID')
        }
      } else {
        throw new Error('OFFER_NOT_CANCELLABLE')
      }

      const updated = await tx.offers.updateMany({
        where: { id: offer.id, status: offer.status },
        data: {
          status: 'canceled',
          canceled_at: now,
          canceled_by_role: actorRole,
          cancel_reason: reason,
          cancellation_phase: cancellationPhase,
          updated_at: now,
        },
      })

      if (updated.count !== 1) {
        throw new Error('OFFER_STATE_CHANGED')
      }

      return {
        offerId: offer.id,
        actorRole,
        recipientUserId,
        cancellationPhase,
        canceledAt: now.toISOString(),
      }
    })

    if (result.recipientUserId) {
      try {
        await emitNotification({
          recipientUserId: result.recipientUserId,
          recipientRole: result.actorRole === 'store' ? 'talent' : 'store',
          event: {
            kind: 'offer_updated',
            offerId: result.offerId,
            actorId: user.id,
            actorName: result.actorRole === 'store' ? '店舗' : '演者',
            change: 'cancellation',
            cancellationPhase: result.cancellationPhase,
            cancelReason: reason,
          },
        })
      } catch (notificationError) {
        console.error('failed to send cancellation notification', notificationError)
      }
    }

    return NextResponse.json(
      {
        ok: true,
        status: 'canceled',
        canceled_at: result.canceledAt,
        canceled_by_role: result.actorRole,
        cancel_reason: reason,
        cancellation_phase: result.cancellationPhase,
      },
      { status: 200 }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : ''

    if (message === 'OFFER_NOT_FOUND') {
      return NextResponse.json({ error: 'オファーが見つかりません' }, { status: 404 })
    }
    if (message === 'FORBIDDEN') {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 })
    }
    if (message === 'USE_DECLINE_FOR_PENDING') {
      return NextResponse.json(
        { error: '契約前の演者側辞退は「今回は対応できない」から操作してください' },
        { status: 409 }
      )
    }
    if (message === 'OFFER_ALREADY_PERFORMED') {
      return NextResponse.json(
        { error: '来店完了後または支払い後の案件はキャンセルできません' },
        { status: 409 }
      )
    }
    if (message === 'CONTRACT_STATE_INVALID') {
      return NextResponse.json(
        { error: '締結情報の状態を確認できないためキャンセルできません' },
        { status: 409 }
      )
    }
    if (message === 'OFFER_NOT_CANCELLABLE' || message === 'OFFER_STATE_CHANGED') {
      return NextResponse.json(
        { error: '現在の状態ではキャンセルできません。画面を更新してください' },
        { status: 409 }
      )
    }

    console.error('[POST /offers/:id/cancel]', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
