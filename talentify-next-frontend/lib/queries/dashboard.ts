import { createClient } from '@/lib/supabase/server'
import type { ScheduleItem } from '@/components/ScheduleCard'

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

  const { count: pendingOffersCount } = talentId
    ? await supabase
        .from('offers')
        .select('*', { count: 'exact', head: true })
        .eq('talent_id', talentId)
        .in('status', ['pending'])
    : { count: 0 }

  const { count: unreadMessagesCount } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('type', 'message')
    .eq('is_read', false)

  const { data: scheduleData } = talentId
    ? await supabase
        .from('offers')
        .select('id, date, time_range, store:store_id(store_name)')
        .eq('talent_id', talentId)
        .eq('status', 'confirmed')
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
  } = await supabase.auth.getUser()

  if (!user) {
    return { offerStats: {} as Record<string, number>, schedule: [] as ScheduleItem[], unreadCount: 0 }
  }

  const { data: store } = await supabase
    .from('stores')
    .select('id')
    .eq('user_id', user.id)
    .single()

  const storeId = store?.id

  const { data: offers } = storeId
    ? await supabase.from('offers').select('status').eq('store_id', storeId)
    : { data: [] }

  const offerStats = (offers ?? []).reduce((acc: Record<string, number>, o: any) => {
    const status = o.status ?? 'unknown'
    acc[status] = (acc[status] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)

  const { data: scheduleData } = storeId
    ? await supabase
        .from('offers')
        .select('id, date, talents(stage_name)')
        .eq('store_id', storeId)
        .eq('status', 'confirmed')
        .gte('date', new Date().toISOString().slice(0, 10))
        .order('date', { ascending: true })
        .limit(5)
    : { data: [] }

  const schedule: ScheduleItem[] = (scheduleData ?? []).map((d: any) => ({
    date: d.date,
    performer: d.talents?.stage_name ?? '',
    status: 'confirmed',
    href: `/store/offers/${d.id}`,
  }))

  const { count: unreadCount } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('type', 'message')
    .eq('is_read', false)

  return { offerStats, schedule, unreadCount: unreadCount ?? 0 }
}
