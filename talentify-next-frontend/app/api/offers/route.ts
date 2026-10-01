import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import {
  createOffer,
  findExistingOfferForCreate,
  findStoreByIdForAuthUser,
  findStoreOffersByAuthUser,
  OFFER_STATUS_TYPES,
  OfferCreateConflictError,
  OfferStatusType,
  findOfferAccessById,
} from '@/lib/repositories/offers'
import { emitNotification } from '@/lib/notifications/emit'
import { getTodayJstDateString } from '@/utils/jstDate'
import {
  buildOfferStorageDate,
  formatOfferTimeRange,
  offerClockFromMinutes,
  parseOfferClockRange,
  parseOfferTimeRange,
} from '@/lib/offers/timeRange'

export const runtime = 'nodejs'

const OFFER_STATUS_VALUES = new Set<OfferStatusType>(OFFER_STATUS_TYPES)

export interface OfferPayload {
  store_id: string
  talent_id: string
  date: string
  time_range?: string
  start_time?: string
  end_time?: string
  reward?: number | null
  agreed: boolean
  message?: string
}

function resolveOfferTimePayload(payload: OfferPayload) {
  const structuredRange = parseOfferClockRange(payload.start_time, payload.end_time)
  const legacyRange = parseOfferTimeRange(payload.time_range)
  const range = structuredRange ?? legacyRange

  if (!range) return null

  return {
    range,
    startClock: offerClockFromMinutes(range.startMinutes),
    endClock: offerClockFromMinutes(range.endMinutes),
    timeRange: formatOfferTimeRange(range),
  }
}

export function validateOfferPayload(payload: OfferPayload): string | null {
  const { store_id, talent_id, date, reward, agreed } = payload

  if (!store_id) return '店舗情報を確認してください'
  if (!talent_id) return '演者を選択してください'
  if (!date) return '希望日を選択してください'
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return '希望日の形式が正しくありません'
  if (date < getTodayJstDateString()) return '希望日は本日以降を選択してください'
  if (!resolveOfferTimePayload(payload)) {
    return '希望時間帯を確認してください'
  }
  if (agreed !== true) return '出演条件への同意が必要です'
  if (reward != null && (!Number.isFinite(reward) || reward < 0)) {
    return '提示金額を確認してください'
  }

  return null
}

export async function GET(req: NextRequest) {
  const { user } = await getCurrentUser()

  if (!user) {
    return NextResponse.json({ ok: false, code: 'UNAUTHORIZED', reason: 'auth required' }, { status: 401 })
  }

  const statusParam = req.nextUrl.searchParams.get('status')
  let status: OfferStatusType | undefined
  if (statusParam) {
    const normalizedStatus = statusParam.trim().toLowerCase() as OfferStatusType
    if (!OFFER_STATUS_VALUES.has(normalizedStatus)) {
      return NextResponse.json({ ok: false, code: 'VALIDATION_ERROR', reason: 'invalid status' }, { status: 400 })
    }
    status = normalizedStatus
  }

  try {
    const offers = await findStoreOffersByAuthUser({ userId: user.id, status })
    return NextResponse.json({ ok: true, offers })
  } catch (error) {
    console.error('[GET /api/offers]', error)
    return NextResponse.json({ ok: false, code: 'FETCH_FAILED', reason: 'failed to fetch offers' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as OfferPayload | null
  if (!body) {
    return NextResponse.json(
      { ok: false, code: 'VALIDATION_ERROR', reason: '入力内容を確認してください' },
      { status: 400 }
    )
  }

  const validationError = validateOfferPayload(body)
  if (validationError) {
    return NextResponse.json({ ok: false, code: 'VALIDATION_ERROR', reason: validationError }, { status: 400 })
  }

  const { user } = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ ok: false, code: 'UNAUTHORIZED', reason: 'auth required' }, { status: 401 })
  }

  // confirm store belongs to user
  const store = await findStoreByIdForAuthUser({
    storeId: body.store_id,
    userId: user.id,
  })
  if (!store) {
    return NextResponse.json(
      { ok: false, code: 'FORBIDDEN', reason: '店舗情報を確認してください' },
      { status: 403 }
    )
  }
  if (!store.is_setup_complete) {
    return NextResponse.json(
      {
        ok: false,
        code: 'PROFILE_INCOMPLETE',
        reason: 'オファー送信前に店舗プロフィールを登録してください',
      },
      { status: 409 }
    )
  }

  const normalizedTime = resolveOfferTimePayload(body)
  if (!normalizedTime) {
    return NextResponse.json(
      { ok: false, code: 'VALIDATION_ERROR', reason: '希望時間帯を確認してください' },
      { status: 400 }
    )
  }

  // check existing offer for idempotency
  const offerDate = new Date(body.date)
  const startTime = buildOfferStorageDate(body.date, normalizedTime.range.startMinutes)
  const endTime = buildOfferStorageDate(body.date, normalizedTime.range.endMinutes)
  const existing = await findExistingOfferForCreate({
    storeId: body.store_id,
    talentId: body.talent_id,
    date: offerDate,
    timeRange: normalizedTime.timeRange,
  })
  if (existing) {
    return NextResponse.json({ ok: true, offer: existing })
  }

  try {
    const offer = await createOffer({
      user_id: user.id,
      store_id: body.store_id,
      talent_id: body.talent_id,
      date: offerDate,
      start_time: startTime,
      end_time: endTime,
      time_range: normalizedTime.timeRange,
      reward: body.reward ?? null,
      agreed: body.agreed,
      message: body.message ?? '',
      status: 'pending',
    })

    const access = await findOfferAccessById(offer.id)
    if (access?.talent_user_id) {
      try {
        await emitNotification({
          recipientUserId: access.talent_user_id,
          event: {
            kind: 'offer_created',
            offerId: offer.id,
            actorId: user.id,
          },
        })
      } catch (notificationError) {
        console.error('failed to create offer notification', notificationError)
      }
    }

    return NextResponse.json({ ok: true, offer })
  } catch (error) {
    if (error instanceof OfferCreateConflictError) {
      // fallback to existing offer lookup
      const fallback = await findExistingOfferForCreate({
        storeId: body.store_id,
        talentId: body.talent_id,
        date: offerDate,
        timeRange: normalizedTime.timeRange,
      })
      if (fallback) {
        return NextResponse.json({ ok: true, offer: fallback })
      }
    }

    const reason = error instanceof Error ? error.message : 'insert failed'
    return NextResponse.json(
      { ok: false, code: 'INSERT_FAILED', reason },
      { status: 500 }
    )
  }
}
