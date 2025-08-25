'use client'
import { createClient } from '@/utils/supabase/client'
import { API_BASE } from '@/lib/api'
import type { Database } from '@/types/supabase'
import type { NotificationType } from '@/types/notifications'

const supabase = createClient()

export type NotificationRow = Database['public']['Tables']['notifications']['Row']

interface AddNotificationPayload {
  user_id: string
  type: NotificationType
  title: string
  body?: string | null
  data?: Record<string, unknown> | null
}

export async function getNotifications(limit?: number): Promise<NotificationRow[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  let query = supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (limit) query = query.limit(limit)

  const { data, error } = await query
  if (error) {
    console.error('failed to fetch notifications', error)
    return []
  }
  return (data ?? []) as NotificationRow[]
}

export async function getUnreadNotificationCount(): Promise<number> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return 0

  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_read', false)

  if (error) {
    console.error('failed to fetch unread notifications count', error)
    return 0
  }
  return count ?? 0
}

export async function markNotificationRead(id: string) {
  await supabase
    .from('notifications')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('id', id)
}

export async function markNotificationUnread(id: string) {
  await supabase
    .from('notifications')
    .update({ is_read: false, read_at: null })
    .eq('id', id)
}

export async function markAllNotificationsRead(ids: string[]) {
  if (ids.length === 0) return
  await supabase
    .from('notifications')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .in('id', ids)
}

export async function addNotification(payload: AddNotificationPayload) {
  try {
    const res = await fetch(`${API_BASE}/api/notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: payload.user_id,
        type: payload.type,
        title: payload.title,
        body: payload.body ?? null,
        payload: payload.data ?? null,
      }),
    })
    if (!res.ok) {
      console.error('failed to add notification', await res.text())
    }
  } catch (error) {
    console.error('failed to add notification', error)
  }
}

export function formatUnreadCount(count: number): string | null {
  if (count <= 0) return null
  return count > 99 ? '99+' : String(count)
}

