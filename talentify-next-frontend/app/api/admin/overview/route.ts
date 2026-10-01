import { NextRequest, NextResponse } from 'next/server'
import { getAdminContext } from '@/lib/admin/auth'
import { createServiceClient } from '@/lib/supabase/service'

export const runtime = 'nodejs'

function cleanQuery(value: string | null) {
  return (value ?? '')
    .trim()
    .replace(/[%_,()'"]/g, '')
    .slice(0, 100)
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

function unique<T>(values: T[]) {
  return [...new Set(values)]
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
  const url = new URL(request.url)

  const q = cleanQuery(url.searchParams.get('q'))
  const role = url.searchParams.get('role')
  const userStatus = cleanQuery(url.searchParams.get('userStatus'))
  const offerQ = cleanQuery(url.searchParams.get('offerQ'))
  const offerStatus = cleanQuery(url.searchParams.get('offerStatus'))
  const inquiryQ = cleanQuery(url.searchParams.get('inquiryQ'))
  const inquiryStatus = cleanQuery(url.searchParams.get('inquiryStatus'))

  const applyUserFilters = (query: any) => {
    let next = query
    if (role === 'store' || role === 'talent') {
      next = next.eq('role', role)
    }
    if (userStatus) {
      next = next.eq('status', userStatus)
    }
    return next
  }

  const userSelect =
    'id,auth_user_id,email,phone,role,status,created_at,updated_at,legal_accepted_at'

  let usersResult: { data: any[] | null; error: any }

  if (q) {
    const directConditions = [
      `email.ilike.%${q}%`,
      `phone.ilike.%${q}%`,
    ]
    if (isUuid(q)) {
      directConditions.push(`id.eq.${q}`, `auth_user_id.eq.${q}`)
    }

    const directUsersQuery = applyUserFilters(
      service
        .from('users')
        .select(userSelect)
        .or(directConditions.join(','))
        .order('created_at', { ascending: false })
        .limit(50),
    )

    const [directUsers, storeMatches, talentMatches] = await Promise.all([
      directUsersQuery,
      service
        .from('stores')
        .select('user_id,store_name')
        .ilike('store_name', `%${q}%`)
        .limit(50),
      service
        .from('talents')
        .select('user_id,stage_name,name,display_name')
        .or(
          [
            `stage_name.ilike.%${q}%`,
            `name.ilike.%${q}%`,
            `display_name.ilike.%${q}%`,
          ].join(','),
        )
        .limit(50),
    ])

    const searchError = directUsers.error ?? storeMatches.error ?? talentMatches.error
    if (searchError) {
      console.error('[admin] user search failed', searchError)
      return NextResponse.json({ error: 'admin_overview_failed' }, { status: 500 })
    }

    const profileAuthUserIds = unique(
      [...(storeMatches.data ?? []), ...(talentMatches.data ?? [])]
        .map((row: any) => row.user_id)
        .filter(Boolean),
    )

    let profileUsers = { data: [] as any[], error: null as any }
    if (profileAuthUserIds.length) {
      profileUsers = await applyUserFilters(
        service
          .from('users')
          .select(userSelect)
          .in('auth_user_id', profileAuthUserIds)
          .order('created_at', { ascending: false })
          .limit(50),
      )
    }

    if (profileUsers.error) {
      console.error('[admin] profile user search failed', profileUsers.error)
      return NextResponse.json({ error: 'admin_overview_failed' }, { status: 500 })
    }

    const merged = new Map<string, any>()
    for (const row of [...(directUsers.data ?? []), ...(profileUsers.data ?? [])]) {
      merged.set(row.id, row)
    }

    usersResult = {
      data: [...merged.values()]
        .sort(
          (a, b) =>
            new Date(b.created_at ?? 0).getTime() -
            new Date(a.created_at ?? 0).getTime(),
        )
        .slice(0, 50),
      error: null,
    }
  } else {
    usersResult = await applyUserFilters(
      service
        .from('users')
        .select(userSelect)
        .order('created_at', { ascending: false })
        .limit(50),
    )
  }

  let offersQuery = service
    .from('offers')
    .select('id,store_id,talent_id,date,status,event_name,updated_at,created_at')
    .order('updated_at', { ascending: false })
    .limit(50)

  if (offerStatus) {
    offersQuery = offersQuery.eq('status', offerStatus)
  }

  if (offerQ) {
    const [storeMatches, talentMatches] = await Promise.all([
      service
        .from('stores')
        .select('id')
        .ilike('store_name', `%${offerQ}%`)
        .limit(50),
      service
        .from('talents')
        .select('id')
        .or(
          [
            `stage_name.ilike.%${offerQ}%`,
            `name.ilike.%${offerQ}%`,
            `display_name.ilike.%${offerQ}%`,
          ].join(','),
        )
        .limit(50),
    ])

    if (storeMatches.error || talentMatches.error) {
      console.error(
        '[admin] offer participant search failed',
        storeMatches.error ?? talentMatches.error,
      )
      return NextResponse.json({ error: 'admin_overview_failed' }, { status: 500 })
    }

    const conditions = [`event_name.ilike.%${offerQ}%`]
    const storeIds = unique((storeMatches.data ?? []).map((row: any) => row.id).filter(Boolean))
    const talentIds = unique((talentMatches.data ?? []).map((row: any) => row.id).filter(Boolean))

    if (storeIds.length) {
      conditions.push(`store_id.in.(${storeIds.join(',')})`)
    }
    if (talentIds.length) {
      conditions.push(`talent_id.in.(${talentIds.join(',')})`)
    }
    if (isUuid(offerQ)) {
      conditions.push(`id.eq.${offerQ}`)
    }

    offersQuery = offersQuery.or(conditions.join(','))
  }

  let inquiriesQuery = service
    .from('contact_inquiries')
    .select('id,created_at,category,name,email,phone,subject,message,status')
    .order('created_at', { ascending: false })
    .limit(50)

  if (inquiryStatus) {
    inquiriesQuery = inquiriesQuery.eq('status', inquiryStatus)
  }
  if (inquiryQ) {
    inquiriesQuery = inquiriesQuery.or(
      [
        `name.ilike.%${inquiryQ}%`,
        `email.ilike.%${inquiryQ}%`,
        `subject.ilike.%${inquiryQ}%`,
      ].join(','),
    )
  }

  const [
    offersResult,
    inquiriesResult,
    auditsResult,
    userCountResult,
    storeCountResult,
    talentCountResult,
    offerCountResult,
    openInquiryCountResult,
    suspendedCountResult,
    offerStatusResult,
  ] = await Promise.all([
    offersQuery,
    inquiriesQuery,
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
    service
      .from('offers')
      .select('status')
      .order('updated_at', { ascending: false })
      .limit(500),
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
    offerStatusResult,
  ]

  const firstError = requiredResults.find(result => result.error)?.error
  if (firstError) {
    console.error('[admin] overview query failed', firstError)
    return NextResponse.json({ error: 'admin_overview_failed' }, { status: 500 })
  }

  const users = usersResult.data ?? []
  const userAuthIds = unique(users.map((row: any) => row.auth_user_id).filter(Boolean))

  const offers = offersResult.data ?? []
  const storeIds = unique(offers.map((offer: any) => offer.store_id).filter(Boolean))
  const talentIds = unique(offers.map((offer: any) => offer.talent_id).filter(Boolean))

  const [visibleStoresResult, visibleTalentsResult, offerStoresResult, offerTalentsResult] =
    await Promise.all([
      userAuthIds.length
        ? service.from('stores').select('user_id,store_name').in('user_id', userAuthIds)
        : Promise.resolve({ data: [], error: null }),
      userAuthIds.length
        ? service
            .from('talents')
            .select('user_id,stage_name,name,display_name')
            .in('user_id', userAuthIds)
        : Promise.resolve({ data: [], error: null }),
      storeIds.length
        ? service.from('stores').select('id,store_name').in('id', storeIds)
        : Promise.resolve({ data: [], error: null }),
      talentIds.length
        ? service
            .from('talents')
            .select('id,stage_name,name,display_name')
            .in('id', talentIds)
        : Promise.resolve({ data: [], error: null }),
    ])

  const participantLookupError =
    visibleStoresResult.error ??
    visibleTalentsResult.error ??
    offerStoresResult.error ??
    offerTalentsResult.error

  if (participantLookupError) {
    console.error('[admin] participant lookup failed', participantLookupError)
    return NextResponse.json({ error: 'admin_overview_failed' }, { status: 500 })
  }

  const storeByUser = new Map(
    (visibleStoresResult.data ?? []).map((row: any) => [row.user_id, row.store_name]),
  )
  const talentByUser = new Map(
    (visibleTalentsResult.data ?? []).map((row: any) => [
      row.user_id,
      row.stage_name || row.display_name || row.name,
    ]),
  )
  const storeMap = new Map(
    (offerStoresResult.data ?? []).map((row: any) => [row.id, row.store_name]),
  )
  const talentMap = new Map(
    (offerTalentsResult.data ?? []).map((row: any) => [
      row.id,
      row.stage_name || row.display_name || row.name,
    ]),
  )

  const offerStatuses = unique(
    (offerStatusResult.data ?? [])
      .map((row: any) => row.status)
      .filter(Boolean),
  ).sort()

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
      users: users.map((user: any) => ({
        ...user,
        profile_label:
          user.role === 'store'
            ? storeByUser.get(user.auth_user_id) ?? null
            : user.role === 'talent'
              ? talentByUser.get(user.auth_user_id) ?? null
              : null,
      })),
      inquiries: inquiriesResult.data ?? [],
      audits: auditsResult.data ?? [],
      offers: offers.map((offer: any) => ({
        ...offer,
        store_name: offer.store_id ? storeMap.get(offer.store_id) ?? null : null,
        talent_name: offer.talent_id ? talentMap.get(offer.talent_id) ?? null : null,
      })),
      filters: {
        offerStatuses,
      },
    },
  })
}
