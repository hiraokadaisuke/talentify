import { createClient } from '@/lib/supabase/server'
import type { ScheduleItem } from '@/components/ScheduleCard'
import { toDbOfferStatus } from '@/app/lib/offerStatus'
import { getCurrentUserWithClient } from '@/lib/auth/getCurrentUserWithClient'
import type { Notification } from '@/types/ui'

export async function getTalentDashboardData() {
  const supabase = createClient()
  const { user } = await getCurrentUserWithClient(supabase)

  if (!user) {
    return {
      pendingOffersCount: 0,
      confirmedOffersCount: 0,
      unreadMessagesCount: 0,
      schedule: [] as ScheduleItem[],
      recentNotifications: [] as Notification[],
      isSetupComplete: false,
    }
  }

  const { data: talent } = await supabase
    .from('talents')
    .select('id, is_setup_complete')
    .eq('user_id', user.id)
    .single()

  const talentId = talent?.id
  const pendingStatus = toDbOfferStatus('pending') ?? 'pending'
  const confirmedStatus = toDbOfferStatus('confirmed') ?? 'confirmed'

  const [pendingResult, unreadResult, scheduleResult, notificationsResult] = await Promise.all([
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
      .eq('receiver_user', user.id)
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
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5),
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

  return {
    pendingOffersCount: pendingResult.count ?? 0,
    confirmedOffersCount: scheduleResult.count ?? 0,
    unreadMessagesCount: unreadResult.count ?? 0,
    schedule,
    recentNotifications,
    isSetupComplete: Boolean(talent?.is_setup_complete),
  }
}

export async function getStoreDashboardData() {
  const supabase = createClient()
  const { user, error: userError } = await getCurrentUserWithClient(supabase)

  if (userError || !user) {
    throw new Error('failed to fetch user session')
  }

  const { data: store } = await supabase
    .from('stores')
    .select('id, is_setup_complete')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!store) {
    return {
      offerStats: {} as Record<string, number>,
      schedule: [] as ScheduleItem[],
      unreadCount: 0,
      recentNotifications: [] as Notification[],
      isSetupComplete: false,
    }
  }

  const confirmedStatus = toDbOfferStatus('confirmed') ?? 'confirmed'

  const [offersResult, scheduleResult, unreadResult, notificationsResult] = await Promise.all([
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
      .eq('receiver_user', user.id)
      .is('read_at', null),
    supabase
      .from('notifications')
      .select('id,type,title,body,data,created_at,is_read')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5),
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

  return {
    offerStats,
    schedule,
    unreadCount: unreadResult.count ?? 0,
    recentNotifications,
    isSetupComplete: Boolean(store.is_setup_complete),
  }
}
