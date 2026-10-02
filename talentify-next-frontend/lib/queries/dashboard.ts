import { createClient } from '@/lib/supabase/server'
import type { ScheduleItem } from '@/components/ScheduleCard'
import { toDbOfferStatus } from '@/app/lib/offerStatus'
import { getProtectedRequestUserId } from '@/lib/auth/getProtectedRequestUserId'
import type { Notification } from '@/types/ui'
import type { ProgressStep } from '@/components/GettingStartedCard'
import { createServiceClient } from '@/lib/supabase/service'

export async function getTalentDashboardData() {
  const supabase = createClient()
  const { userId } = await getProtectedRequestUserId(supabase)

  if (!userId) {
    return {
      pendingOffersCount: 0,
      confirmedOffersCount: 0,
      unreadMessagesCount: 0,
      schedule: [] as ScheduleItem[],
      recentNotifications: [] as Notification[],
      onboardingSteps: [
        { key: 'profile', complete: false },
        { key: 'schedule', complete: false },
        { key: 'billing', complete: false },
        { key: 'offer', complete: false },
      ] as ProgressStep[],
      isSetupComplete: false,
    }
  }

  const { data: talent } = await supabase
    .from('talents')
    .select('id, is_setup_complete, is_profile_complete')
    .eq('user_id', userId)
    .single()

  const talentId = talent?.id
  const service = createServiceClient() as any
  const pendingStatus = toDbOfferStatus('pending') ?? 'pending'
  const confirmedStatus = toDbOfferStatus('confirmed') ?? 'confirmed'

  const [
    pendingResult,
    unreadResult,
    scheduleResult,
    notificationsResult,
    availabilityResult,
    billingResult,
    allOffersResult,
  ] = await Promise.all([
    talentId
      ? supabase
          .from('offers')
          .select('*', { count: 'exact', head: true })
          .eq('talent_id', talentId)
          .in('status', [pendingStatus])
      : Promise.resolve({ count: 0 }),
    supabase
      .from('offer_messages')
      .select('id', { count: 'exact', head: true })
      .eq('receiver_user', userId)
      .is('read_at', null),
    talentId
      ? supabase
          .from('offers')
          .select(
            `
            id, date, time_range,
            store:stores!offers_store_id_fkey(id, store_name)
          `,
            { count: 'exact' }
          )
          .eq('talent_id', talentId)
          .eq('status', confirmedStatus)
          .gte('date', new Date().toISOString().slice(0, 10))
          .order('date', { ascending: true })
          .limit(5)
      : Promise.resolve({ data: [], count: 0 }),
    supabase
      .from('notifications')
      .select('id,type,title,body,data,created_at,is_read')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5),
    service
      .from('talent_availability_settings')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle(),
    service
      .from('talent_billing_profiles')
      .select('billing_name')
      .eq('user_id', userId)
      .maybeSingle(),
    talentId
      ? service
          .from('offers')
          .select('id', { count: 'exact', head: true })
          .eq('talent_id', talentId)
      : Promise.resolve({ count: 0, error: null }),
  ])

  const schedule: ScheduleItem[] = (scheduleResult.data ?? []).map((d: any) => ({
    date: d.date,
    performer: d.store?.store_name ?? '',
    status: 'confirmed',
    href: `/talent/offers/${d.id}`,
  }))

  if (notificationsResult.error) {
    console.error('failed to preload talent dashboard notifications', notificationsResult.error)
  }

  const recentNotifications: Notification[] = (notificationsResult.data ?? []).map((item: any) => ({
    id: item.id,
    type: item.type,
    title: item.title,
    body: item.body ?? item.title,
    data:
      item.data && typeof item.data === 'object' && !Array.isArray(item.data)
        ? item.data
        : undefined,
    created_at: item.created_at ?? '',
    is_read: Boolean(item.is_read),
  }))

  if (availabilityResult.error || billingResult.error || allOffersResult.error) {
    console.error(
      'failed to preload talent onboarding progress',
      availabilityResult.error ?? billingResult.error ?? allOffersResult.error,
    )
  }

  const onboardingSteps: ProgressStep[] = [
    {
      key: 'profile',
      complete: Boolean(talent?.is_setup_complete || talent?.is_profile_complete),
    },
    { key: 'schedule', complete: Boolean(availabilityResult.data) },
    { key: 'billing', complete: Boolean(billingResult.data?.billing_name) },
    { key: 'offer', complete: (allOffersResult.count ?? 0) > 0 },
  ]

  return {
    pendingOffersCount: pendingResult.count ?? 0,
    confirmedOffersCount: scheduleResult.count ?? 0,
    unreadMessagesCount: unreadResult.count ?? 0,
    schedule,
    recentNotifications,
    onboardingSteps,
    isSetupComplete: Boolean(talent?.is_setup_complete),
  }
}

export async function getStoreDashboardData() {
  const supabase = createClient()
  const { userId, error: userError } = await getProtectedRequestUserId(supabase)

  if (userError || !userId) {
    throw new Error('failed to fetch user session')
  }

  const { data: store } = await supabase
    .from('stores')
    .select('id, is_setup_complete, is_profile_complete')
    .eq('user_id', userId)
    .maybeSingle()

  if (!store) {
    return {
      offerStats: {} as Record<string, number>,
      schedule: [] as ScheduleItem[],
      unreadCount: 0,
      recentNotifications: [] as Notification[],
      onboardingSteps: [
        { key: 'profile', complete: false },
        { key: 'discover', complete: false },
        { key: 'offer', complete: false },
      ] as ProgressStep[],
      isSetupComplete: false,
    }
  }

  const service = createServiceClient() as any
  const confirmedStatus = toDbOfferStatus('confirmed') ?? 'confirmed'

  const [offersResult, scheduleResult, unreadResult, notificationsResult, favoritesResult] = await Promise.all([
    supabase.from('offers').select('status').eq('store_id', store.id),
    supabase
      .from('offers')
      .select('id, date, talents(stage_name)')
      .eq('store_id', store.id)
      .eq('status', confirmedStatus)
      .gte('date', new Date().toISOString().slice(0, 10))
      .order('date', { ascending: true })
      .limit(5),
    supabase
      .from('offer_messages')
      .select('id', { count: 'exact', head: true })
      .eq('receiver_user', userId)
      .is('read_at', null),
    supabase
      .from('notifications')
      .select('id,type,title,body,data,created_at,is_read')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5),
    service
      .from('store_favorite_talents')
      .select('talent_id', { count: 'exact', head: true })
      .eq('store_id', store.id),
  ])

  if (offersResult.error) {
    throw new Error(offersResult.error.message)
  }
  if (scheduleResult.error) {
    throw new Error(scheduleResult.error.message)
  }

  const offerStats = (offersResult.data ?? []).reduce((acc: Record<string, number>, o: any) => {
    const status = o.status ?? 'unknown'
    acc[status] = (acc[status] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)

  const schedule: ScheduleItem[] = (scheduleResult.data ?? []).map((d: any) => ({
    date: d.date,
    performer: d.talents?.stage_name ?? '',
    status: 'confirmed',
    href: `/store/offers/${d.id}`,
  }))

  if (notificationsResult.error) {
    console.error('failed to preload store dashboard notifications', notificationsResult.error)
  }

  const recentNotifications: Notification[] = (notificationsResult.data ?? []).map((item: any) => ({
    id: item.id,
    type: item.type,
    title: item.title,
    body: item.body ?? item.title,
    data:
      item.data && typeof item.data === 'object' && !Array.isArray(item.data)
        ? item.data
        : undefined,
    created_at: item.created_at ?? '',
    is_read: Boolean(item.is_read),
  }))

  if (favoritesResult.error) {
    console.error('failed to preload store onboarding progress', favoritesResult.error)
  }

  const hasOffer = (offersResult.data ?? []).length > 0
  const onboardingSteps: ProgressStep[] = [
    {
      key: 'profile',
      complete: Boolean(store.is_setup_complete || store.is_profile_complete),
    },
    {
      key: 'discover',
      complete: hasOffer || (favoritesResult.count ?? 0) > 0,
    },
    { key: 'offer', complete: hasOffer },
  ]

  return {
    offerStats,
    schedule,
    unreadCount: unreadResult.count ?? 0,
    recentNotifications,
    onboardingSteps,
    isSetupComplete: Boolean(store.is_setup_complete),
  }
}
