import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const role = new URL(request.url).searchParams.get('role')
  if (role !== 'store' && role !== 'talent') {
    return NextResponse.json({ error: 'invalid_role' }, { status: 400 })
  }

  const supabase = createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const service = createServiceClient() as any
  const { data: appUser, error: appUserError } = await service
    .from('users')
    .select('role')
    .eq('auth_user_id', user.id)
    .maybeSingle()

  if (appUserError) {
    console.error('[onboarding] failed to load app user', appUserError)
    return NextResponse.json({ error: 'status_lookup_failed' }, { status: 500 })
  }

  if (appUser?.role !== role) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  if (role === 'store') {
    const { data: store, error: storeError } = await service
      .from('stores')
      .select('id,is_setup_complete,is_profile_complete')
      .eq('user_id', user.id)
      .maybeSingle()

    if (storeError) {
      console.error('[onboarding] failed to load store', storeError)
      return NextResponse.json({ error: 'status_lookup_failed' }, { status: 500 })
    }

    if (!store) {
      return NextResponse.json({
        data: {
          steps: [
            { key: 'profile', complete: false },
            { key: 'discover', complete: false },
            { key: 'offer', complete: false },
          ],
        },
      })
    }

    const [favorites, offers] = await Promise.all([
      service
        .from('store_favorite_talents')
        .select('talent_id', { count: 'exact', head: true })
        .eq('store_id', store.id),
      service
        .from('offers')
        .select('id', { count: 'exact', head: true })
        .eq('store_id', store.id),
    ])

    if (favorites.error || offers.error) {
      console.error('[onboarding] failed to load store progress', favorites.error ?? offers.error)
      return NextResponse.json({ error: 'status_lookup_failed' }, { status: 500 })
    }

    const hasOffer = (offers.count ?? 0) > 0
    return NextResponse.json({
      data: {
        steps: [
          {
            key: 'profile',
            complete: Boolean(store.is_setup_complete || store.is_profile_complete),
          },
          {
            key: 'discover',
            complete: hasOffer || (favorites.count ?? 0) > 0,
          },
          { key: 'offer', complete: hasOffer },
        ],
      },
    })
  }

  const { data: talent, error: talentError } = await service
    .from('talents')
    .select('id,is_setup_complete,is_profile_complete')
    .eq('user_id', user.id)
    .maybeSingle()

  if (talentError) {
    console.error('[onboarding] failed to load talent', talentError)
    return NextResponse.json({ error: 'status_lookup_failed' }, { status: 500 })
  }

  if (!talent) {
    return NextResponse.json({
      data: {
        steps: [
          { key: 'profile', complete: false },
          { key: 'schedule', complete: false },
          { key: 'billing', complete: false },
          { key: 'offer', complete: false },
        ],
      },
    })
  }

  const [availability, billing, offers] = await Promise.all([
    service
      .from('talent_availability_settings')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle(),
    service
      .from('talent_billing_profiles')
      .select('billing_name')
      .eq('user_id', user.id)
      .maybeSingle(),
    service
      .from('offers')
      .select('id', { count: 'exact', head: true })
      .eq('talent_id', talent.id),
  ])

  if (availability.error || billing.error || offers.error) {
    console.error(
      '[onboarding] failed to load talent progress',
      availability.error ?? billing.error ?? offers.error,
    )
    return NextResponse.json({ error: 'status_lookup_failed' }, { status: 500 })
  }

  return NextResponse.json({
    data: {
      steps: [
        {
          key: 'profile',
          complete: Boolean(talent.is_setup_complete || talent.is_profile_complete),
        },
        { key: 'schedule', complete: Boolean(availability.data) },
        { key: 'billing', complete: Boolean(billing.data?.billing_name) },
        { key: 'offer', complete: (offers.count ?? 0) > 0 },
      ],
    },
  })
}
