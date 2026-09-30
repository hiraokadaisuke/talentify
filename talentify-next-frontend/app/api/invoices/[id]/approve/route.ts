import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { getPrismaClient } from '@/lib/prisma'
import { emitNotification } from '@/lib/notifications/emit'

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { user, error: userError } = await getCurrentUser()
    if (userError || !user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (storeError || !store) {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 })
    }

    const prisma = getPrismaClient()
    const now = new Date()

    const result = await prisma.$transaction(async tx => {
      const invoice = await tx.invoices.findUnique({
        where: { id: params.id },
        select: {
          id: true,
          offer_id: true,
          store_id: true,
          talent_id: true,
          status: true,
          amount: true,
        },
      })

      if (!invoice) throw new Error('ESTIMATE_NOT_FOUND')
      if (invoice.store_id !== store.id) throw new Error('FORBIDDEN')
      if (invoice.status !== 'submitted') throw new Error('ESTIMATE_NOT_SUBMITTED')
      if (!invoice.offer_id) throw new Error('OFFER_NOT_FOUND')

      const offer = await tx.offers.findUnique({
        where: { id: invoice.offer_id },
        select: { id: true, status: true },
      })

      if (!offer) throw new Error('OFFER_NOT_FOUND')
      if (offer.status !== 'pending') throw new Error('OFFER_STATE_CHANGED')

      const offerUpdated = await tx.offers.updateMany({
        where: { id: offer.id, status: 'pending' },
        data: {
          status: 'confirmed',
          accepted_at: now,
          invoice_amount: invoice.amount,
          invoice_date: now,
          invoice_submitted: true,
          updated_at: now,
        },
      })

      if (offerUpdated.count !== 1) throw new Error('OFFER_STATE_CHANGED')

      const contracted = await tx.invoices.update({
        where: { id: invoice.id },
        data: { status: 'approved', updated_at: now },
      })

      return {
        invoice: contracted,
        offerId: offer.id,
        talentId: invoice.talent_id,
      }
    })

    try {
      const service = createServiceClient()
      if (result.talentId) {
        const { data: talent } = await service
          .from('talents')
          .select('user_id')
          .eq('id', result.talentId)
          .maybeSingle()

        if (talent?.user_id) {
          await emitNotification({
            recipientUserId: talent.user_id,
            recipientRole: 'talent',
            event: {
              kind: 'offer_accepted',
              offerId: result.offerId,
              actorName: '店舗',
              actorId: user.id,
            },
          })
        }
      }
    } catch (notificationError) {
      console.error('failed to send contract notification', notificationError)
    }

    return NextResponse.json(result.invoice, { status: 200 })
  } catch (e) {
    const message = e instanceof Error ? e.message : ''
    if (message === 'ESTIMATE_NOT_FOUND') {
      return NextResponse.json({ error: '見積書が見つかりません' }, { status: 404 })
    }
    if (message === 'FORBIDDEN') {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 })
    }
    if (message === 'ESTIMATE_NOT_SUBMITTED' || message === 'OFFER_STATE_CHANGED') {
      return NextResponse.json(
        { error: '見積または案件の状態が変更されています。画面を更新してください' },
        { status: 409 }
      )
    }
    if (message === 'OFFER_NOT_FOUND') {
      return NextResponse.json({ error: '対象案件が見つかりません' }, { status: 404 })
    }

    console.error('[POST /invoices/:id/approve]', e)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
