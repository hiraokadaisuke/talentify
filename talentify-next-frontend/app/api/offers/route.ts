import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { logger } from '@/lib/logger'
import { createHash } from 'crypto'

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

  // fetch talent user id for notification
  const { data: talent, error: talentError } = await service
    .from('talents')
    .select('user_id')
    .eq('id', body.talent_id)
    .single()
  if (talentError || !talent || !talent.user_id) {
    return NextResponse.json({ ok: false, code: 'VALIDATION_ERROR', reason: 'talent not found' }, { status: 400 })
  }

  const key = createHash('sha256')
    .update(`${body.store_id}:${body.talent_id}:${body.date}:${body.time_range}`)
    .digest('hex')

  // check existing offer for idempotency
  const { data: existing } = await service
    .from('offers')
    .select('*')
    .eq('store_id', body.store_id)
    .eq('talent_id', body.talent_id)
    .eq('date', body.date)
    .eq('time_range', body.time_range)
    .maybeSingle()
  if (existing) {
    return NextResponse.json({ ok: true, offer: existing, notifications: [] })
  }

  logger.info({ level: 'info', message: 'offer.create.request', context: { user_id: user.id, store_id: body.store_id, talent_id: body.talent_id } })

  const { data: offer, error: offerError } = await service
    .from('offers')
    .insert({
      user_id: user.id,
      store_id: body.store_id,
      talent_id: body.talent_id,
      date: body.date,
      time_range: body.time_range,
      agreed: body.agreed,
      message: body.message ?? '',
      status: 'pending',
    })
    .select()
    .single()
  if (offerError || !offer) {
    logger.error({ level: 'error', message: 'offer.create.fail', context: { reason: offerError?.message } })
    return NextResponse.json({ ok: false, code: 'INSERT_FAILED', reason: offerError?.message ?? 'insert failed' }, { status: 500 })
  }

  logger.info({ level: 'info', message: 'offer.create.success', context: { offer_id: offer.id } })
  logger.info({ level: 'info', message: 'notification.create.request', context: { offer_id: offer.id } })

  // dedupe notifications with idempotency key
  const { data: existingNotification } = await service
    .from('notifications')
    .select('*')
    .eq('user_id', talent.user_id)
    .eq('type', 'offer_created')
    .contains('data', { idempotency_key: key })
    .maybeSingle()

  if (existingNotification) {
    return NextResponse.json({ ok: true, offer, notifications: [existingNotification] })
  }

  const payload = {
    offer_id: offer.id,
    store_id: body.store_id,
    talent_id: body.talent_id,
    date: body.date,
    time_range: body.time_range,
    message: body.message ?? '',
    idempotency_key: key,
  }

  const { data: notification, error: notificationError } = await service
    .from('notifications')
    .insert({
      user_id: talent.user_id,
      type: 'offer_created',
      title: '新しいオファーが届きました',
      data: payload,
    })
    .select()
    .single()

  if (notificationError || !notification) {
    logger.error({ level: 'error', message: 'notification.create.fail', context: { reason: notificationError?.message } })
    await service.from('offers').delete().eq('id', offer.id)
    return NextResponse.json({ ok: false, code: 'INSERT_FAILED', reason: notificationError?.message ?? 'insert failed' }, { status: 500 })
  }

  logger.info({ level: 'info', message: 'notification.create.success', context: { notification_id: notification.id } })

  return NextResponse.json({ ok: true, offer, notifications: [notification] })
}
