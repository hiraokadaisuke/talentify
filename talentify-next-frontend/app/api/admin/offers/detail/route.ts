import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAdminContext } from '@/lib/admin/auth'
import { createServiceClient } from '@/lib/supabase/service'

export const runtime = 'nodejs'

const querySchema = z.object({
  offerId: z.string().uuid(),
})

export async function GET(request: NextRequest) {
  const admin = await getAdminContext()
  if (!admin.user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  if (!admin.isAdmin) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  const parsed = querySchema.safeParse({
    offerId: new URL(request.url).searchParams.get('offerId'),
  })
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_input' }, { status: 400 })
  }

  const service = createServiceClient() as any
  const { data: offer, error: offerError } = await service
    .from('offers')
    .select(
      [
        'id',
        'store_id',
        'talent_id',
        'user_id',
        'date',
        'start_time',
        'end_time',
        'time_range',
        'event_name',
        'message',
        'notes',
        'reward',
        'status',
        'agreed',
        'paid',
        'paid_at',
        'accepted_at',
        'invoice_date',
        'invoice_amount',
        'invoice_submitted',
        'invoice_url',
        'contract_url',
        'created_at',
        'updated_at',
        'canceled_at',
        'canceled_by_role',
        'cancellation_reason',
        'cancellation_stage',
        'canceled_by_user_id',
        'visit_completed_at',
        'no_show_at',
        'no_show_reason',
        'no_show_reported_by_user_id',
      ].join(','),
    )
    .eq('id', parsed.data.offerId)
    .maybeSingle()

  if (offerError) {
    console.error('[admin] failed to load offer detail', offerError)
    return NextResponse.json({ error: 'offer_detail_failed' }, { status: 500 })
  }
  if (!offer) {
    return NextResponse.json({ error: 'offer_not_found' }, { status: 404 })
  }

  const [storeResult, talentResult, invoicesResult, messagesResult, reviewsResult] =
    await Promise.all([
      offer.store_id
        ? service
            .from('stores')
            .select(
              'id,user_id,store_name,contact_name,contact_phone,contact_email,store_prefect,store_address,is_profile_complete',
            )
            .eq('id', offer.store_id)
            .maybeSingle()
        : Promise.resolve({ data: null, error: null }),
      offer.talent_id
        ? service
            .from('talents')
            .select(
              'id,user_id,name,stage_name,display_name,agency_name,residence,preferred_contact_method,phone_contact_allowed,phone_available_hours,is_profile_complete',
            )
            .eq('id', offer.talent_id)
            .maybeSingle()
        : Promise.resolve({ data: null, error: null }),
      service
        .from('invoices')
        .select(
          'id,offer_id,amount,status,payment_status,due_date,invoice_number,paid_at,transport_fee,extra_fee,notes,contract_snapshot,invoice_url,created_at,updated_at',
        )
        .eq('offer_id', offer.id)
        .order('created_at', { ascending: false }),
      service
        .from('offer_messages')
        .select(
          'id,sender_user,sender_role,receiver_user,body,attachments,created_at,read_at',
        )
        .eq('offer_id', offer.id)
        .order('created_at', { ascending: true })
        .limit(200),
      service
        .from('reviews')
        .select('id,rating,comment,category_ratings,is_public,created_at,store_id,talent_id')
        .eq('offer_id', offer.id)
        .order('created_at', { ascending: true }),
    ])

  const detailError =
    storeResult.error ??
    talentResult.error ??
    invoicesResult.error ??
    messagesResult.error ??
    reviewsResult.error

  if (detailError) {
    console.error('[admin] failed to load offer related detail', detailError)
    return NextResponse.json({ error: 'offer_detail_failed' }, { status: 500 })
  }

  const authUserIds = [
    storeResult.data?.user_id,
    talentResult.data?.user_id,
  ].filter(Boolean)

  const usersResult = authUserIds.length
    ? await service
        .from('users')
        .select('id,auth_user_id,email,phone,role,status')
        .in('auth_user_id', authUserIds)
    : { data: [], error: null }

  if (usersResult.error) {
    console.error('[admin] failed to load offer participant accounts', usersResult.error)
    return NextResponse.json({ error: 'offer_detail_failed' }, { status: 500 })
  }

  const userMap = new Map(
    (usersResult.data ?? []).map((row: any) => [row.auth_user_id, row]),
  )

  return NextResponse.json({
    data: {
      offer,
      store: storeResult.data
        ? {
            ...storeResult.data,
            account: userMap.get(storeResult.data.user_id) ?? null,
          }
        : null,
      talent: talentResult.data
        ? {
            ...talentResult.data,
            account: userMap.get(talentResult.data.user_id) ?? null,
          }
        : null,
      invoices: invoicesResult.data ?? [],
      messages: messagesResult.data ?? [],
      reviews: reviewsResult.data ?? [],
    },
  })
}
