import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { createClient } from '@/lib/supabase/server'
import { emitNotification } from '@/lib/notifications/emit'
import { getPrismaClient } from '@/lib/prisma'
import {
  buildOfferStorageDate,
  formatOfferTimeRange,
  parseOfferClockRange,
  parseStoredOfferTimeRange,
  timeRangesOverlap,
} from '@/lib/offers/timeRange'
import { getTodayJstDateString } from '@/utils/jstDate'

type SchedulePayload = {
  date?: unknown
  start_time?: unknown
  end_time?: unknown
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = (await req.json().catch(() => null)) as SchedulePayload | null
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'リクエスト形式が正しくありません' }, { status: 400 })
    }

    const date = typeof body.date === 'string' ? body.date : ''
    const startTime = typeof body.start_time === 'string' ? body.start_time : ''
    const endTime = typeof body.end_time === 'string' ? body.end_time : ''

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ error: '日付を確認してください' }, { status: 400 })
    }
    if (date < getTodayJstDateString()) {
      return NextResponse.json({ error: '本日以降の日付を選択してください' }, { status: 400 })
    }

    const requestedRange = parseOfferClockRange(startTime, endTime)
    if (!requestedRange) {
      return NextResponse.json(
        { error: '終了時刻は開始時刻より後を選択してください' },
        { status: 400 }
      )
    }

    const { user, error: userError } = await getCurrentUser()
    if (userError || !user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const supabase = await createClient()
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (storeError || !store) {
      return NextResponse.json({ error: '店舗アカウントで利用してください' }, { status: 403 })
    }

    const prisma = getPrismaClient()
    const normalizedTimeRange = formatOfferTimeRange(requestedRange)
    const newDate = new Date(`${date}T00:00:00.000Z`)
    const newStart = buildOfferStorageDate(date, requestedRange.startMinutes)
    const newEnd = buildOfferStorageDate(date, requestedRange.endMinutes)
    const now = new Date()

    const result = await prisma.$transaction(async tx => {
      const offer = await tx.offers.findUnique({
        where: { id: params.id },
        select: {
          id: true,
          store_id: true,
          talent_id: true,
          status: true,
          date: true,
          start_time: true,
          end_time: true,
          time_range: true,
          talents: { select: { user_id: true } },
        },
      })

      if (!offer) throw new Error('OFFER_NOT_FOUND')
      if (offer.store_id !== store.id) throw new Error('FORBIDDEN')
      if (offer.status !== 'pending') throw new Error('OFFER_LOCKED')
      if (!offer.talent_id) throw new Error('TALENT_NOT_FOUND')

      const invoice = await tx.invoices.findFirst({
        where: { offer_id: offer.id },
        select: { id: true, status: true },
      })

      if (invoice && !['draft', 'rejected'].includes(invoice.status ?? '')) {
        throw new Error('ESTIMATE_MUST_BE_REOPENED')
      }

      const currentRange = parseStoredOfferTimeRange(offer.start_time, offer.end_time)
      const sameDate = offer.date.toISOString().slice(0, 10) === date
      const sameTime =
        currentRange?.startMinutes === requestedRange.startMinutes &&
        currentRange?.endMinutes === requestedRange.endMinutes

      if (sameDate && sameTime) {
        throw new Error('NO_SCHEDULE_CHANGE')
      }

      const blockingOffers = await tx.offers.findMany({
        where: {
          id: { not: offer.id },
          talent_id: offer.talent_id,
          date: newDate,
          status: { in: ['confirmed', 'completed'] },
        },
        select: {
          id: true,
          start_time: true,
          end_time: true,
          time_range: true,
        },
      })

      const conflict = blockingOffers.some(existingOffer => {
        const existingRange = parseStoredOfferTimeRange(
          existingOffer.start_time,
          existingOffer.end_time
        )
        return !existingRange || timeRangesOverlap(requestedRange, existingRange)
      })

      if (conflict) throw new Error('TALENT_SCHEDULE_CONFLICT')

      const updated = await tx.offers.updateMany({
        where: { id: offer.id, status: 'pending' },
        data: {
          date: newDate,
          start_time: newStart,
          end_time: newEnd,
          time_range: normalizedTimeRange,
          updated_at: now,
        },
      })

      if (updated.count !== 1) throw new Error('OFFER_STATE_CHANGED')

      return {
        offerId: offer.id,
        talentUserId: offer.talents?.user_id ?? null,
        date,
        timeRange: normalizedTimeRange,
      }
    })

    if (result.talentUserId) {
      try {
        await emitNotification({
          recipientUserId: result.talentUserId,
          recipientRole: 'talent',
          event: {
            kind: 'offer_updated',
            offerId: result.offerId,
            actorId: user.id,
            actorName: '店舗',
            change: 'schedule',
            date: result.date,
            timeRange: result.timeRange,
          },
        })
      } catch (notificationError) {
        console.error('failed to send reschedule notification', notificationError)
      }
    }

    return NextResponse.json(
      {
        ok: true,
        date: result.date,
        time_range: result.timeRange,
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
    if (message === 'TALENT_NOT_FOUND') {
      return NextResponse.json({ error: '演者情報が見つかりません' }, { status: 404 })
    }
    if (message === 'OFFER_LOCKED' || message === 'OFFER_STATE_CHANGED') {
      return NextResponse.json(
        { error: '契約成立後または現在の状態では日時を変更できません' },
        { status: 409 }
      )
    }
    if (message === 'ESTIMATE_MUST_BE_REOPENED') {
      return NextResponse.json(
        {
          error:
            '見積提出後は日時を変更できません。先に「修正を依頼する」で見積を下書きへ戻してください。',
          code: 'ESTIMATE_MUST_BE_REOPENED',
        },
        { status: 409 }
      )
    }
    if (message === 'TALENT_SCHEDULE_CONFLICT') {
      return NextResponse.json(
        {
          error: 'この演者は指定時間帯に別の締結済み案件があります。',
          code: 'TALENT_SCHEDULE_CONFLICT',
        },
        { status: 409 }
      )
    }
    if (message === 'NO_SCHEDULE_CHANGE') {
      return NextResponse.json({ error: '日時が変更されていません' }, { status: 400 })
    }

    console.error('[PATCH /offers/:id/schedule]', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
