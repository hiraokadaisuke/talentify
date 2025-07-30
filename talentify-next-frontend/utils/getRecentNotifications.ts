'use client'

import { createClient } from '@/utils/supabase/client'
import type { Notification } from '@/types/ui'

/**
 * Fetch recent notifications related to the current user.
 * This is a simplified example and does not cover RLS or webhooks.
 */
export async function getRecentNotifications(): Promise<Notification[]> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  // Unread messages
  const { data: messages } = await supabase
    .from('messages' as any)
    .select('*')
    .eq('topic', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  // Pending offers for talents
  const { data: offers } = await supabase
    .from('offers' as any)
    .select('*')
    .eq('talent_id', user.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  // Check if current user is a store
  const { data: store } = await supabase
    .from('stores')
    .select('id')
    .eq('user_id', user.id)
    .single()

  const { data: accepted } = store
    ? await supabase
        .from('offers')
        .select('id, created_at, talents(stage_name), date')
        .eq('store_id', store.id)
        .eq('status', 'accepted')
    : { data: null }

  // Schedules for the next 7 days
  const { data: schedules } = await supabase
    .from('schedules')
    .select('*')
    .eq('user_id', user.id)
    .gte('date', new Date().toISOString())
    .lte('date', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString())

  // Confirmed offers (upcoming schedules)
  const { data: confirmed } = await supabase
    .from('offers')
    .select('id, fixed_date, time_range, stores(store_name)')
    .eq('talent_id', user.id)
    .eq('status', 'confirmed')
    .not('fixed_date', 'is', null)
    .gte('fixed_date', new Date().toISOString())

  const notifications: Notification[] = []

  messages?.forEach((m) =>
    notifications.push({
      id: (m as any).id,
      type: 'message',
      title: '新着メッセージ',
      body: (m as any).content ?? '',
      created_at: (m as any).created_at ?? '',
      is_read: false,
    }),
  )

  offers?.forEach((o) =>
    notifications.push({
      id: (o as any).id,
      type: 'offer',
      title: 'オファー対応待ち',
      body: `オファーの日程 ${(o as any).date}`,
      created_at: (o as any).created_at ?? '',
      is_read: false,
    }),
  )

  accepted?.forEach((o) =>
    notifications.push({
      id: (o as any).id,
      type: 'offer',
      title: 'オファー承諾通知',
      body: `🎉 ${(o as any).talents?.stage_name ?? ''} さんがオファーを承諾しました`,
      created_at: (o as any).created_at ?? '',
      is_read: false,
    }),
  )

  schedules?.forEach((s) =>
    notifications.push({
      id: s.id,
      type: 'schedule',
      title: '今週の予定',
      body: s.description ?? '',
      created_at: s.date ?? '',
      is_read: true,
    }),
  )

  confirmed?.forEach((c) =>
    notifications.push({
      id: (c as any).id,
      type: 'schedule',
      title: '出演日確定',
      body: `[${(c as any).stores?.store_name ?? ''}] ${(c as any).fixed_date} ${(c as any).time_range ?? ''}`.trim(),
      created_at: (c as any).fixed_date ?? '',
      is_read: false,
    }),
  )

  // Sort by created_at desc
  return notifications.sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
}
