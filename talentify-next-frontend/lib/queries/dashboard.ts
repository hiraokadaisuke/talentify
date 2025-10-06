import { createClient } from '@/lib/supabase/server'
import type { ScheduleItem } from '@/components/ScheduleCard'
import { toDbOfferStatus } from '@/app/lib/offerStatus'

export async function getTalentDashboardData() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { pendingOffersCount: 0, unreadMessagesCount: 0, schedule: [] as ScheduleItem[] }
  }

  const { data: talent } = await supabase
    .from('talents')
    .select('id')
    .eq('user_id', user.id)
    .single()

  const talentId = talent?.id

  const pendingStatus = toDbOfferStatus('pending') ?? 'pending'

  const { count: pendingOffersCount } = talentId
    ? await supabase
        .from('offers')
        .select('*', { count: 'exact', head: true })
        .eq('talent_id', talentId)
        .in('status', [pendingStatus])
    : { count: 0 }

  const { count: unreadMessagesCount } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('type', 'message')
    .eq('is_read', false)

  const confirmedStatus = toDbOfferStatus('confirmed') ?? 'confirmed'

  const { data: scheduleData } = talentId
    ? await supabase
        .from('offers')
        .select(
          `
          id, date, time_range,
          store:stores!offers_store_id_fkey(id, store_name)
        `
        )
        .eq('talent_id', talentId)
        .eq('status', confirmedStatus)
        .order('date', { ascending: true })
    : { data: [] }

  const schedule: ScheduleItem[] = (scheduleData ?? []).map((d: any) => ({
    date: d.date,
    performer: d.store?.store_name ?? '',
    status: 'confirmed',
    href: `/talent/offers/${d.id}`,
  }))

  return {
    pendingOffersCount: pendingOffersCount ?? 0,
    unreadMessagesCount: unreadMessagesCount ?? 0,
    schedule,
  }
}

export async function getStoreDashboardData() {
  const supabase = createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error('failed to fetch user session')
  }

  const {
    data: store,
    error: storeError,
  } = await supabase
    .from('stores')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (storeError || !store) {
    throw new Error(storeError?.message ?? 'store not found')
  }

  const confirmedStatus = toDbOfferStatus('confirmed') ?? 'confirmed'

  const {
    data: offers,
    error: offersError,
  } = await supabase.from('offers').select('status').eq('store_id', store.id)

  if (offersError) {
    throw new Error(offersError.message)
  }

  const offerStats = (offers ?? []).reduce((acc: Record<string, number>, o: any) => {
    const status = o.status ?? 'unknown'
    acc[status] = (acc[status] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)

  const {
    data: scheduleData,
    error: scheduleError,
  } = await supabase
    .from('offers')
    .select('id, date, talents(stage_name)')
    .eq('store_id', store.id)
    .eq('status', confirmedStatus)
    .gte('date', new Date().toISOString().slice(0, 10))
    .order('date', { ascending: true })
    .limit(5)

  if (scheduleError) {
    throw new Error(scheduleError.message)
  }

  const schedule: ScheduleItem[] = (scheduleData ?? []).map((d: any) => ({
    date: d.date,
    performer: d.talents?.stage_name ?? '',
    status: 'confirmed',
    href: `/store/offers/${d.id}`,
  }))

  const { count: unreadCount, error: unreadError } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('type', 'message')
    .eq('is_read', false)

  if (unreadError) {
    throw new Error(unreadError.message)
  }

  return { offerStats, schedule, unreadCount: unreadCount ?? 0 }
}
