import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { getPrismaClient } from '@/lib/prisma'
import { emitNotification } from '@/lib/notifications/emit'

type CancelPayload = {
  reason?: unknown
}

const MIN_REASON_LENGTH = 5
const MAX_REASON_LENGTH = 500

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = (await req.json().catch(() => null)) as CancelPayload | null
    const reason = typeof body?.reason === 'string' ? body.reason.trim() : ''

    if (reason.length < MIN_REASON_LENGTH) {
      return NextResponse.json(
        { error: 'キャンセル理由を5文字以上で入力してください' },
        { status: 400 }
      )
    }
    if (reason.length > MAX_REASON_LENGTH) {
      return NextResponse.json(
        { error: 'キャンセル理由は500文字以内で入力してください' },
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
          store_id: true,
          talent_id: true,
          stores: { select: { user_id: true } },
          talents: { select: { user_id: true } },
          invoices: {
            select: {
              id: true,
              status: true,
              contract_snapshot: true,
            },
          },
        },
      })

      if (!offer) throw new Error('OFFER_NOT_FOUND')
      if (offer.status === 'canceled') throw new Error('ALREADY_CANCELED')
      if (offer.paid || offer.visit_completed_at) throw new Error('OFFER_ALREADY_PERFORMED')

      const storeUserId = offer.stores?.user_id ?? null
      const talentUserId = offer.talents?.user_id ?? null

      let actorRole: 'store' | 'talent'
      if (storeUserId === user.id) {
        actorRole = 'store'
      } else if (talentUserId === user.id) {
        actorRole = 'talent'
      } else {
        throw new Error('FORBIDDEN')
      }

      const isPreContract = offer.status === 'pending'
      const isPostContract = offer.status === 'confirmed'

      if (actorRole === 'store') {
        if (!isPreContract && !isPostContract) {
          throw new Error('CANCELLATION_NOT_ALLOWED')
        }
      } else if (!isPostContract) {
        // Before contract, performers use the existing "decline" flow.
        throw new Error('CANCELLATION_NOT_ALLOWED')
      }

      const cancellationStage = isPostContract ? 'post_contract' : 'pre_contract'
      const invoice = offer.invoices ?? null

      if (isPostContract && invoice?.status !== 'approved') {
        throw new Error('CONTRACT_INVOICE_NOT_APPROVED')
      }

      const updated = await tx.offers.updateMany({
        where: {
          id: offer.id,
          status: offer.status,
          paid: false,
        },
        data: {
          status: 'canceled',
          canceled_at: now,
          canceled_by_role: actorRole,
          canceled_by_user_id: user.id,
          cancellation_reason: reason,
          cancellation_stage: cancellationStage,
          updated_at: now,
        },
      })

      if (updated.count !== 1) throw new Error('OFFER_STATE_CHANGED')

      return {
        offerId: offer.id,
        actorRole,
        recipientUserId: actorRole === 'store' ? talentUserId : storeUserId,
        cancellationStage,
        canceledAt: now.toISOString(),
        reason,
        invoiceId: invoice?.id ?? null,
        invoiceStatus: invoice?.status ?? null,
        contractSnapshotPreserved:
          cancellationStage === 'post_contract' &&
          invoice?.contract_snapshot != null,
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
            status: 'canceled',
            change: 'cancellation',
            cancellationStage: result.cancellationStage,
            reason: result.reason,
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
        cancellation_stage: result.cancellationStage,
        cancellation_reason: result.reason,
        invoice_id: result.invoiceId,
        invoice_status: result.invoiceStatus,
        contract_snapshot_preserved: result.contractSnapshotPreserved,
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
    if (message === 'ALREADY_CANCELED') {
      return NextResponse.json({ error: 'すでにキャンセルされています' }, { status: 409 })
    }
    if (message === 'OFFER_ALREADY_PERFORMED') {
      return NextResponse.json(
        { error: '来店完了後または支払い完了後の案件はキャンセルできません' },
        { status: 409 }
      )
    }
    if (message === 'CANCELLATION_NOT_ALLOWED') {
      return NextResponse.json(
        { error: '現在の状態ではキャンセルできません' },
        { status: 409 }
      )
    }
    if (message === 'OFFER_STATE_CHANGED') {
      return NextResponse.json(
        { error: '案件の状態が変更されています。画面を更新してください' },
        { status: 409 }
      )
    }
    if (message === 'CONTRACT_INVOICE_NOT_APPROVED') {
      return NextResponse.json(
        { error: '締結書兼請求書の状態が正しくないためキャンセルできません' },
        { status: 409 }
      )
    }

    console.error('[POST /offers/:id/cancel]', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
