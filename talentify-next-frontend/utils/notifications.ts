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

type GetNotificationsResponse = {
  data?: NotificationRow[]
}

type GetUnreadCountResponse = {
  count?: number
}

export async function getNotifications(limit?: number): Promise<NotificationRow[]> {
  try {
    const searchParams = new URLSearchParams()
    if (typeof limit === 'number' && Number.isFinite(limit) && limit > 0) {
      searchParams.set('limit', String(Math.floor(limit)))
    }

    const suffix = searchParams.toString()
    const res = await fetch(`${API_BASE}/api/notifications${suffix ? `?${suffix}` : ''}`)

    if (!res.ok) {
      if (res.status !== 401) {
        console.error('failed to fetch notifications', await res.text())
      }
      return []
    }

    const payload = (await res.json()) as GetNotificationsResponse
    return Array.isArray(payload.data) ? payload.data : []
  } catch (error) {
    console.error('failed to fetch notifications', error)
    return []
  }
}

export async function getUnreadNotificationCount(): Promise<number> {
  try {
    const res = await fetch(`${API_BASE}/api/notifications?unread_count=true`)
    if (!res.ok) {
      if (res.status !== 401) {
        console.error('failed to fetch unread notifications count', await res.text())
      }
      return 0
    }

    const payload = (await res.json()) as GetUnreadCountResponse
    return typeof payload.count === 'number' ? payload.count : 0
  } catch (error) {
    console.error('failed to fetch unread notifications count', error)
    return 0
  }
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
