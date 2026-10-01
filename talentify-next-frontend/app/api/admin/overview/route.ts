import { NextRequest, NextResponse } from 'next/server'
import { getAdminContext } from '@/lib/admin/auth'
import { createServiceClient } from '@/lib/supabase/service'

export const runtime = 'nodejs'

function cleanQuery(value: string | null) {
  return (value ?? '').trim().replace(/[%_,()]/g, '').slice(0, 100)
}

export async function GET(request: NextRequest) {
  const admin = await getAdminContext()
  if (!admin.user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  if (!admin.isAdmin) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  const service = createServiceClient() as any
  const q = cleanQuery(new URL(request.url).searchParams.get('q'))

  let usersQuery = service
    .from('users')
    .select('id,auth_user_id,email,phone,role,status,created_at,updated_at,legal_accepted_at')
    .order('created_at', { ascending: false })
    .limit(50)

  if (q) {
    usersQuery = usersQuery.ilike('email', `%${q}%`)
  }

  const [
    usersResult,
    offersResult,
    inquiriesResult,
    auditsResult,
    userCountResult,
    storeCountResult,
    talentCountResult,
    offerCountResult,
    openInquiryCountResult,
    suspendedCountResult,
  ] = await Promise.all([
    usersQuery,
    service
      .from('offers')
      .select('id,store_id,talent_id,date,status,updated_at,created_at')
      .order('updated_at', { ascending: false })
      .limit(30),
    service
      .from('contact_inquiries')
      .select('id,created_at,category,name,email,phone,subject,message,status')
      .order('created_at', { ascending: false })
      .limit(30),
    service
      .from('admin_audit_log')
      .select('id,admin_auth_user_id,action,target_type,target_id,metadata,created_at')
      .order('created_at', { ascending: false })
      .limit(30),
    service.from('users').select('id', { count: 'exact', head: true }),
    service.from('stores').select('id', { count: 'exact', head: true }),
    service.from('talents').select('id', { count: 'exact', head: true }),
    service.from('offers').select('id', { count: 'exact', head: true }),
    service
      .from('contact_inquiries')
      .select('id', { count: 'exact', head: true })
      .in('status', ['new', 'in_progress']),
    service
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'suspended'),
  ])

  const requiredResults = [
    usersResult,
    offersResult,
    inquiriesResult,
    auditsResult,
    userCountResult,
    storeCountResult,
    talentCountResult,
    offerCountResult,
    openInquiryCountResult,
    suspendedCountResult,
  ]

  const firstError = requiredResults.find(result => result.error)?.error
  if (firstError) {
    console.error('[admin] overview query failed', firstError)
    return NextResponse.json({ error: 'admin_overview_failed' }, { status: 500 })
  }

  const offers = offersResult.data ?? []
  const storeIds = [...new Set(offers.map((offer: any) => offer.store_id).filter(Boolean))]
  const talentIds = [...new Set(offers.map((offer: any) => offer.talent_id).filter(Boolean))]

  const [storesResult, talentsResult] = await Promise.all([
    storeIds.length
      ? service.from('stores').select('id,store_name').in('id', storeIds)
      : Promise.resolve({ data: [], error: null }),
    talentIds.length
      ? service.from('talents').select('id,stage_name,name').in('id', talentIds)
      : Promise.resolve({ data: [], error: null }),
  ])

  if (storesResult.error || talentsResult.error) {
    console.error('[admin] offer participant lookup failed', storesResult.error ?? talentsResult.error)
    return NextResponse.json({ error: 'admin_overview_failed' }, { status: 500 })
  }

  const storeMap = new Map((storesResult.data ?? []).map((row: any) => [row.id, row.store_name]))
  const talentMap = new Map(
    (talentsResult.data ?? []).map((row: any) => [row.id, row.stage_name || row.name]),
  )

  return NextResponse.json({
    data: {
      summary: {
        users: userCountResult.count ?? 0,
        stores: storeCountResult.count ?? 0,
        talents: talentCountResult.count ?? 0,
        offers: offerCountResult.count ?? 0,
        openInquiries: openInquiryCountResult.count ?? 0,
        suspendedUsers: suspendedCountResult.count ?? 0,
      },
      users: usersResult.data ?? [],
      inquiries: inquiriesResult.data ?? [],
      audits: auditsResult.data ?? [],
      offers: offers.map((offer: any) => ({
        ...offer,
        store_name: offer.store_id ? storeMap.get(offer.store_id) ?? null : null,
        talent_name: offer.talent_id ? talentMap.get(offer.talent_id) ?? null : null,
      })),
    },
  })
}
