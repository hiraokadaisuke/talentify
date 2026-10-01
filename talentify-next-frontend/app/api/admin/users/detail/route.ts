import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAdminContext } from '@/lib/admin/auth'
import { createServiceClient } from '@/lib/supabase/service'

export const runtime = 'nodejs'

const querySchema = z.object({
  userId: z.string().uuid(),
})

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

  const parsed = querySchema.safeParse({
    userId: new URL(request.url).searchParams.get('userId'),
  })
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_input' }, { status: 400 })
  }

  const service = createServiceClient() as any
  const { data: user, error: userError } = await service
    .from('users')
    .select(
      'id,auth_user_id,email,phone,role,status,created_at,updated_at,terms_version,privacy_version,legal_accepted_at',
    )
    .eq('id', parsed.data.userId)
    .maybeSingle()

  if (userError) {
    console.error('[admin] failed to load user detail', userError)
    return NextResponse.json({ error: 'user_detail_failed' }, { status: 500 })
  }
  if (!user) {
    return NextResponse.json({ error: 'user_not_found' }, { status: 404 })
  }

  let profile: any = null
  let profileError: any = null

  if (user.role === 'store') {
    const result = await service
      .from('stores')
      .select(
        'id,user_id,store_name,contact_name,contact_phone,contact_email,store_prefect,store_address,bio,avatar_url,is_setup_complete,is_profile_complete,created_at,updated_at',
      )
      .eq('user_id', user.auth_user_id)
      .maybeSingle()
    profile = result.data
    profileError = result.error
  } else if (user.role === 'talent') {
    const result = await service
      .from('talents')
      .select(
        'id,user_id,name,stage_name,display_name,agency_name,genre,residence,area,location,rate,transportation,min_hours,preferred_contact_method,phone_contact_allowed,phone_available_hours,is_setup_complete,is_profile_complete,created_at,updated_at',
      )
      .eq('user_id', user.auth_user_id)
      .maybeSingle()
    profile = result.data
    profileError = result.error
  }

  if (profileError) {
    console.error('[admin] failed to load user profile detail', profileError)
    return NextResponse.json({ error: 'user_detail_failed' }, { status: 500 })
  }

  let offersResult = { data: [] as any[], error: null as any }
  if (profile?.id && user.role === 'store') {
    offersResult = await service
      .from('offers')
      .select('id,store_id,talent_id,date,status,event_name,reward,created_at,updated_at')
      .eq('store_id', profile.id)
      .order('updated_at', { ascending: false })
      .limit(50)
  } else if (profile?.id && user.role === 'talent') {
    offersResult = await service
      .from('offers')
      .select('id,store_id,talent_id,date,status,event_name,reward,created_at,updated_at')
      .eq('talent_id', profile.id)
      .order('updated_at', { ascending: false })
      .limit(50)
  }

  if (offersResult.error) {
    console.error('[admin] failed to load related offers', offersResult.error)
    return NextResponse.json({ error: 'user_detail_failed' }, { status: 500 })
  }

  const offers = offersResult.data ?? []
  const offerIds = offers.map((offer: any) => offer.id)
  const storeIds = unique(offers.map((offer: any) => offer.store_id).filter(Boolean))
  const talentIds = unique(offers.map((offer: any) => offer.talent_id).filter(Boolean))

  const [storesResult, talentsResult, invoiceCountResult, reviewCountResult, messageCountResult] =
    await Promise.all([
      storeIds.length
        ? service.from('stores').select('id,store_name').in('id', storeIds)
        : Promise.resolve({ data: [], error: null }),
      talentIds.length
        ? service
            .from('talents')
            .select('id,stage_name,display_name,name')
            .in('id', talentIds)
        : Promise.resolve({ data: [], error: null }),
      offerIds.length
        ? service
            .from('invoices')
            .select('id', { count: 'exact', head: true })
            .in('offer_id', offerIds)
        : Promise.resolve({ count: 0, error: null }),
      offerIds.length
        ? service
            .from('reviews')
            .select('id', { count: 'exact', head: true })
            .in('offer_id', offerIds)
        : Promise.resolve({ count: 0, error: null }),
      offerIds.length
        ? service
            .from('offer_messages')
            .select('id', { count: 'exact', head: true })
            .in('offer_id', offerIds)
        : Promise.resolve({ count: 0, error: null }),
    ])

  const detailError =
    storesResult.error ??
    talentsResult.error ??
    invoiceCountResult.error ??
    reviewCountResult.error ??
    messageCountResult.error

  if (detailError) {
    console.error('[admin] failed to load user related detail', detailError)
    return NextResponse.json({ error: 'user_detail_failed' }, { status: 500 })
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

  return NextResponse.json({
    data: {
      user,
      profile,
      summary: {
        offers: offers.length,
        invoices: invoiceCountResult.count ?? 0,
        reviews: reviewCountResult.count ?? 0,
        messages: messageCountResult.count ?? 0,
      },
      offers: offers.map((offer: any) => ({
        ...offer,
        store_name: offer.store_id ? storeMap.get(offer.store_id) ?? null : null,
        talent_name: offer.talent_id ? talentMap.get(offer.talent_id) ?? null : null,
      })),
    },
  })
}
