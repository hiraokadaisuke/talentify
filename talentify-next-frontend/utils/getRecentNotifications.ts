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
    .from('messages')
    .select('*')
    .eq('receiver_id', user.id)
    .eq('is_read', false)
    .order('created_at', { ascending: false })
    .limit(5)

  // Pending offers
  const { data: offers } = await supabase
    .from('offers')
    .select('*')
    .eq('talent_id', user.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  // Schedules for the next 7 days
  const { data: schedules } = await supabase
    .from('schedules')
    .select('*')
    .eq('user_id', user.id)
    .gte('date', new Date().toISOString())
    .lte('date', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString())

  const notifications: Notification[] = []

  messages?.forEach((m) =>
    notifications.push({
      id: m.id,
      type: 'message',
      title: '新着メッセージ',
      body: m.text ?? '',
      created_at: m.created_at ?? '',
      is_read: !!m.is_read,
    }),
  )

  offers?.forEach((o) =>
    notifications.push({
      id: o.id,
      type: 'offer',
      title: 'オファー対応待ち',
      body: `オファーの日程 ${o.date}`,
      created_at: o.created_at ?? '',
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

  // Sort by created_at desc
  return notifications.sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
}
