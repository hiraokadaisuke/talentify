import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { Prisma } from '@prisma/client'
import { getPrismaClient } from '@/lib/prisma'
import { emitNotification } from '@/lib/notifications/emit'
import { parseOfferTimeRange, timeRangesOverlap } from '@/lib/offers/timeRange'

type PayoutSnapshotRow = {
  bank_name: string | null
  branch_name: string | null
  account_type: string | null
  account_number: string | null
  account_holder: string | null
}

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
          transport_fee: true,
          extra_fee: true,
          due_date: true,
          invoice_number: true,
          notes: true,
        },
      })

      if (!invoice) throw new Error('ESTIMATE_NOT_FOUND')
      if (!invoice.store_id || invoice.store_id !== store.id) throw new Error('FORBIDDEN')
      if (invoice.status !== 'submitted') throw new Error('ESTIMATE_NOT_SUBMITTED')
      if (!invoice.offer_id) throw new Error('OFFER_NOT_FOUND')
      if (!invoice.talent_id) throw new Error('TALENT_NOT_FOUND')

      const offer = await tx.offers.findUnique({
        where: { id: invoice.offer_id },
        select: { id: true, status: true, date: true, time_range: true },
      })

      if (!offer) throw new Error('OFFER_NOT_FOUND')
      if (offer.status !== 'pending') throw new Error('OFFER_STATE_CHANGED')

      // Serialize contract approvals for the same talent so concurrent stores
      // cannot both confirm the same performer for the same day.
      await tx.$queryRaw<{ id: string }[]>`
        SELECT id
        FROM public.talents
        WHERE id = ${invoice.talent_id}::uuid
        FOR UPDATE
      `

      const blockingOffers = await tx.offers.findMany({
        where: {
          id: { not: offer.id },
          talent_id: invoice.talent_id,
          date: offer.date,
          status: { in: ['confirmed', 'completed'] },
        },
        select: { id: true, time_range: true },
      })

      const candidateRange = parseOfferTimeRange(offer.time_range)
      const scheduleConflict = blockingOffers.find(existingOffer => {
        const existingRange = parseOfferTimeRange(existingOffer.time_range)

        // Legacy or malformed ranges are treated conservatively as a same-day conflict.
        if (!candidateRange || !existingRange) return true

        return timeRangesOverlap(candidateRange, existingRange)
      })

      if (scheduleConflict) throw new Error('TALENT_SCHEDULE_CONFLICT')

      const [storeSnapshot, talentSnapshot, payoutRows] = await Promise.all([
        tx.stores.findUnique({
          where: { id: invoice.store_id },
          select: { store_name: true, store_address: true, contact_name: true },
        }),
        tx.talents.findUnique({
          where: { id: invoice.talent_id },
          select: { stage_name: true, display_name: true, name: true },
        }),
        tx.$queryRaw<PayoutSnapshotRow[]>`
          SELECT bank_name, branch_name, account_type, account_number, account_holder
          FROM public.talent_payout_accounts
          WHERE talent_id = ${invoice.talent_id}::uuid
          LIMIT 1
        `,
      ])

      const payoutSnapshot = payoutRows[0] ?? null
      const contractSnapshot: Prisma.InputJsonValue = {
        version: 1,
        captured_at: now.toISOString(),
        store_name: storeSnapshot?.store_name ?? '店舗名未設定',
        store_address: storeSnapshot?.store_address ?? null,
        store_contact_name: storeSnapshot?.contact_name ?? null,
        talent_name:
          talentSnapshot?.stage_name ??
          talentSnapshot?.display_name ??
          talentSnapshot?.name ??
          '演者名未設定',
        invoice: {
          invoice_number: invoice.invoice_number,
          amount: invoice.amount,
          transport_fee: invoice.transport_fee ?? 0,
          extra_fee: invoice.extra_fee ?? 0,
          due_date: invoice.due_date ? invoice.due_date.toISOString().slice(0, 10) : null,
          notes: invoice.notes ?? null,
        },
        payout: payoutSnapshot
          ? {
              bank_name: payoutSnapshot.bank_name,
              branch_name: payoutSnapshot.branch_name,
              account_type: payoutSnapshot.account_type,
              account_number: payoutSnapshot.account_number,
              account_holder: payoutSnapshot.account_holder,
            }
          : null,
      }

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
        data: {
          status: 'approved',
          updated_at: now,
          contract_snapshot: contractSnapshot,
        },
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
    if (message === 'TALENT_SCHEDULE_CONFLICT') {
      return NextResponse.json(
        {
          error: 'この演者は同じ時間帯に別の締結済み案件があります。時間または日程を調整してください',
          code: 'TALENT_SCHEDULE_CONFLICT',
        },
        { status: 409 }
      )
    }
    if (message === 'OFFER_NOT_FOUND') {
      return NextResponse.json({ error: '対象案件が見つかりません' }, { status: 404 })
    }
    if (message === 'TALENT_NOT_FOUND') {
      return NextResponse.json({ error: '演者情報が見つかりません' }, { status: 404 })
    }

    console.error('[POST /invoices/:id/approve]', e)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
