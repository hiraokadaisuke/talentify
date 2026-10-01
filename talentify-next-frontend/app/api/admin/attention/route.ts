import { NextResponse } from 'next/server'
import { getAdminContext } from '@/lib/admin/auth'
import { createServiceClient } from '@/lib/supabase/service'

export const runtime = 'nodejs'

const STALE_DAYS = 7
const EXCEPTION_DAYS = 30
const PRE_CONTRACT_STATUSES = ['draft', 'pending', 'approved', 'offer_created', 'submitted']

function unique<T>(values: T[]) {
  return [...new Set(values)]
}

export async function GET() {
  const admin = await getAdminContext()
  if (!admin.user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  if (!admin.isAdmin) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  const service = createServiceClient() as any
  const now = Date.now()
  const staleBefore = new Date(now - STALE_DAYS * 24 * 60 * 60 * 1000).toISOString()
  const exceptionSince = new Date(now - EXCEPTION_DAYS * 24 * 60 * 60 * 1000).toISOString()

  const offerSelect =
    'id,store_id,talent_id,date,status,event_name,reward,updated_at,created_at,visit_completed_at,paid,paid_at,invoice_amount,canceled_at,cancellation_reason,no_show_at,no_show_reason'

  const [
    inquiriesResult,
    staleOffersResult,
    unpaidOffersResult,
    exceptionsResult,
    inquiryCountResult,
    staleCountResult,
    unpaidCountResult,
    exceptionCountResult,
  ] = await Promise.all([
    service
      .from('contact_inquiries')
      .select('id,created_at,category,name,email,subject,status')
      .in('status', ['new', 'in_progress'])
      .order('created_at', { ascending: true })
      .limit(20),
    service
      .from('offers')
      .select(offerSelect)
      .in('status', PRE_CONTRACT_STATUSES)
      .lt('updated_at', staleBefore)
      .order('updated_at', { ascending: true })
      .limit(20),
    service
      .from('offers')
      .select(offerSelect)
      .not('visit_completed_at', 'is', null)
      .or('paid.eq.false,paid.is.null')
      .order('visit_completed_at', { ascending: true })
      .limit(20),
    service
      .from('offers')
      .select(offerSelect)
      .or(`canceled_at.gte.${exceptionSince},no_show_at.gte.${exceptionSince}`)
      .order('updated_at', { ascending: false })
      .limit(20),
    service
      .from('contact_inquiries')
      .select('id', { count: 'exact', head: true })
      .in('status', ['new', 'in_progress']),
    service
      .from('offers')
      .select('id', { count: 'exact', head: true })
      .in('status', PRE_CONTRACT_STATUSES)
      .lt('updated_at', staleBefore),
    service
      .from('offers')
      .select('id', { count: 'exact', head: true })
      .not('visit_completed_at', 'is', null)
      .or('paid.eq.false,paid.is.null'),
    service
      .from('offers')
      .select('id', { count: 'exact', head: true })
      .or(`canceled_at.gte.${exceptionSince},no_show_at.gte.${exceptionSince}`),
  ])

  const results = [
    inquiriesResult,
    staleOffersResult,
    unpaidOffersResult,
    exceptionsResult,
    inquiryCountResult,
    staleCountResult,
    unpaidCountResult,
    exceptionCountResult,
  ]

  const firstError = results.find(result => result.error)?.error
  if (firstError) {
    console.error('[admin] attention center query failed', firstError)
    return NextResponse.json({ error: 'admin_attention_failed' }, { status: 500 })
  }

  const offerRows = [
    ...(staleOffersResult.data ?? []),
    ...(unpaidOffersResult.data ?? []),
    ...(exceptionsResult.data ?? []),
  ]
  const storeIds = unique(offerRows.map((row: any) => row.store_id).filter(Boolean))
  const talentIds = unique(offerRows.map((row: any) => row.talent_id).filter(Boolean))

  const [storesResult, talentsResult] = await Promise.all([
    storeIds.length
      ? service.from('stores').select('id,store_name').in('id', storeIds)
      : Promise.resolve({ data: [], error: null }),
    talentIds.length
      ? service
          .from('talents')
          .select('id,stage_name,display_name,name')
          .in('id', talentIds)
      : Promise.resolve({ data: [], error: null }),
  ])

  if (storesResult.error || talentsResult.error) {
    console.error(
      '[admin] attention participant lookup failed',
      storesResult.error ?? talentsResult.error,
    )
    return NextResponse.json({ error: 'admin_attention_failed' }, { status: 500 })
  }

  const storeMap = new Map(
    (storesResult.data ?? []).map((row: any) => [row.id, row.store_name]),
  )
  const talentMap = new Map(
    (talentsResult.data ?? []).map((row: any) => [
      row.id,
      row.stage_name || row.display_name || row.name,
    ]),
  )

  const enrichOffer = (offer: any) => ({
    ...offer,
    store_name: offer.store_id ? storeMap.get(offer.store_id) ?? null : null,
    talent_name: offer.talent_id ? talentMap.get(offer.talent_id) ?? null : null,
  })

  return NextResponse.json({
    data: {
      thresholds: {
        staleDays: STALE_DAYS,
        exceptionDays: EXCEPTION_DAYS,
      },
      counts: {
        inquiries: inquiryCountResult.count ?? 0,
        staleOffers: staleCountResult.count ?? 0,
        unpaidOffers: unpaidCountResult.count ?? 0,
        exceptions: exceptionCountResult.count ?? 0,
      },
      inquiries: inquiriesResult.data ?? [],
      staleOffers: (staleOffersResult.data ?? []).map(enrichOffer),
      unpaidOffers: (unpaidOffersResult.data ?? []).map(enrichOffer),
      exceptions: (exceptionsResult.data ?? []).map(enrichOffer),
    },
  })
}
