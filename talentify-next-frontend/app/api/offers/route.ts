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
} from '@/lib/repositories/offers'

export const runtime = 'nodejs'

const OFFER_STATUS_VALUES = new Set<OfferStatusType>(OFFER_STATUS_TYPES)

export interface OfferPayload {
  store_id: string
  talent_id: string
  date: string
  time_range: string
  agreed: boolean
  message?: string
}

export function validateOfferPayload(payload: OfferPayload): string | null {
  const { store_id, talent_id, date, time_range, agreed } = payload
  if (!store_id || !talent_id || !date || !time_range) {
    return 'missing fields'
  }
  if (agreed !== true) {
    return 'agreed must be true'
  }
  const d = new Date(date)
  if (Number.isNaN(d.getTime()) || d < new Date(new Date().toISOString().slice(0, 10))) {
    return 'invalid date'
  }
  if (typeof time_range !== 'string' || time_range.trim() === '') {
    return 'invalid time_range'
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
  const body = (await req.json()) as OfferPayload
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
    return NextResponse.json({ ok: false, code: 'FORBIDDEN', reason: 'invalid store' }, { status: 403 })
  }

  // check existing offer for idempotency
  const offerDate = new Date(body.date)
  const existing = await findExistingOfferForCreate({
    storeId: body.store_id,
    talentId: body.talent_id,
    date: offerDate,
    timeRange: body.time_range,
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
      time_range: body.time_range,
      agreed: body.agreed,
      message: body.message ?? '',
      status: 'pending',
    })

    // Notification creation is handled by a database trigger
    return NextResponse.json({ ok: true, offer })
  } catch (error) {
    if (error instanceof OfferCreateConflictError) {
      // fallback to existing offer lookup
      const fallback = await findExistingOfferForCreate({
        storeId: body.store_id,
        talentId: body.talent_id,
        date: offerDate,
        timeRange: body.time_range,
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
