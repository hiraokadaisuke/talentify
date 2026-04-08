import { NextRequest, NextResponse } from 'next/server'
import { toDbOfferStatus } from '@/app/lib/offerStatus'
import {
  findOffers,
  findStoreIdByUserId,
  OFFER_STATUS_FILTERS,
  type OfferStatusFilter,
} from '@/lib/repositories/offers/findOffers'
import { createServiceClient } from '@/lib/supabase/service'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

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


const OFFER_STATUS_VALUES = new Set<string>(OFFER_STATUS_FILTERS)

function isOfferStatusFilter(value: string): value is OfferStatusFilter {
  return OFFER_STATUS_VALUES.has(value)
}

function parseOfferStatusParam(rawStatus: string | null): OfferStatusFilter | undefined {
  if (!rawStatus) return undefined
  if (!isOfferStatusFilter(rawStatus)) return undefined
  return rawStatus
}

export async function GET(req: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ ok: false, code: 'UNAUTHORIZED', reason: 'auth required' }, { status: 401 })
  }

  const rawStatus = req.nextUrl.searchParams.get('status')
  const status = parseOfferStatusParam(rawStatus)
  if (rawStatus && !status) {
    return NextResponse.json(
      { ok: false, code: 'VALIDATION_ERROR', reason: 'invalid status query parameter' },
      { status: 400 }
    )
  }

  try {
    const storeId = await findStoreIdByUserId(user.id)

    if (!storeId) {
      // Store profile does not exist for this authenticated user yet, so not found is appropriate.
      return NextResponse.json({ ok: false, code: 'STORE_NOT_FOUND', reason: 'store not found' }, { status: 404 })
    }

    const offers = await findOffers({
      storeId,
      status,
    })

    return NextResponse.json({ ok: true, offers })
  } catch (error) {
    console.error('GET /api/offers failed', error)
    return NextResponse.json({ ok: false, code: 'INTERNAL_SERVER_ERROR' }, { status: 500 })
  }
}
export async function POST(req: NextRequest) {
  const body = (await req.json()) as OfferPayload
  const validationError = validateOfferPayload(body)
  if (validationError) {
    return NextResponse.json({ ok: false, code: 'VALIDATION_ERROR', reason: validationError }, { status: 400 })
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ ok: false, code: 'UNAUTHORIZED', reason: 'auth required' }, { status: 401 })
  }

  const service = createServiceClient()

  // confirm store belongs to user
  const { data: store, error: storeError } = await service
    .from('stores')
    .select('id, user_id')
    .eq('id', body.store_id)
    .single()
  if (storeError || !store || store.user_id !== user.id) {
    return NextResponse.json({ ok: false, code: 'FORBIDDEN', reason: 'invalid store' }, { status: 403 })
  }

  // check existing offer for idempotency
  const { data: existingRows } = await service
    .from('offers')
    .select('*')
    .eq('store_id', body.store_id)
    .eq('talent_id', body.talent_id)
    .eq('date', body.date)
    .eq('time_range', body.time_range)
    .order('created_at', { ascending: false })
    .limit(1)

  const existing = existingRows?.[0] ?? null
  if (existing) {
    return NextResponse.json({ ok: true, offer: existing })
  }

  const { data: offer, error: offerError, status: insertStatus } = await service
    .from('offers')
    .insert({
      user_id: user.id,
      store_id: body.store_id,
      talent_id: body.talent_id,
      date: body.date,
      time_range: body.time_range,
      agreed: body.agreed,
      message: body.message ?? '',
      status: toDbOfferStatus('pending') ?? 'pending',
    })
    .select()
    .single()
  if (offerError || !offer) {
    if (insertStatus === 409 || offerError?.code === '23505') {
      // fallback to existing offer lookup
      const { data: fallbackRows } = await service
        .from('offers')
        .select('*')
        .eq('store_id', body.store_id)
        .eq('talent_id', body.talent_id)
        .eq('date', body.date)
        .eq('time_range', body.time_range)
        .order('created_at', { ascending: false })
        .limit(1)
      const fallback = fallbackRows?.[0] ?? null
      if (fallback) {
        return NextResponse.json({ ok: true, offer: fallback })
      }
    }
    return NextResponse.json(
      { ok: false, code: 'INSERT_FAILED', reason: offerError?.message ?? 'insert failed' },
      { status: 500 }
    )
  }

  // Notification creation is handled by a database trigger
  return NextResponse.json({ ok: true, offer })
}
