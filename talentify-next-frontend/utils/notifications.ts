'use client'
import { API_BASE } from '@/lib/api'
import type { Database } from '@/types/supabase'
import type { NotificationType } from '@/types/notifications'

export type NotificationRow = Database['public']['Tables']['notifications']['Row']

interface AddNotificationPayload {
  type: NotificationType
  title: string
  body?: string | null
  data?: Record<string, unknown> | null
  priority?: 'low' | 'medium' | 'high'
  action_url?: string | null
  action_label?: string | null
  entity_type?: string | null
  entity_id?: string | null
  actor_name?: string | null
  expires_at?: string | null
  group_key?: string | null
}

type GetNotificationsResponse = {
  data?: NotificationRow[]
}

type GetUnreadCountResponse = {
  count?: number
}

type GetNotificationsOptions = {
  limit?: number
  unreadOnly?: boolean
  actionableOnly?: boolean
  category?: 'announcement' | 'notification'
}

export const NOTIFICATIONS_CHANGED_EVENT = 'talentify:notifications-changed'

function emitNotificationsChanged() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(NOTIFICATIONS_CHANGED_EVENT))
}

async function patchNotificationReadState(id: string, isRead: boolean): Promise<void> {
  try {
    const res = await fetch(`${API_BASE}/api/notifications/${id}/read`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_read: isRead }),
    })

    if (!res.ok && res.status !== 401) {
      console.error('failed to update notification read state', await res.text())
    }
  } catch (error) {
    console.error('failed to update notification read state', error)
  }
}

export async function getNotifications(options?: number | GetNotificationsOptions): Promise<NotificationRow[]> {
  try {
    const searchParams = new URLSearchParams()
    const normalized = typeof options === 'number' ? { limit: options } : options

    if (typeof normalized?.limit === 'number' && Number.isFinite(normalized.limit) && normalized.limit > 0) {
      searchParams.set('limit', String(Math.floor(normalized.limit)))
    }

    if (normalized?.unreadOnly) searchParams.set('unread_only', 'true')
    if (normalized?.actionableOnly) searchParams.set('actionable_only', 'true')
    if (normalized?.category) searchParams.set('category', normalized.category)

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
  await patchNotificationReadState(id, true)
  emitNotificationsChanged()
}

export async function markNotificationUnread(id: string) {
  await patchNotificationReadState(id, false)
  emitNotificationsChanged()
}

export async function markAllNotificationsRead(ids: string[]) {
  if (ids.length === 0) return

  try {
    const res = await fetch(`${API_BASE}/api/notifications/read-all`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    })

    if (!res.ok && res.status !== 401) {
      console.error('failed to mark all notifications as read', await res.text())
    }
  } catch (error) {
    console.error('failed to mark all notifications as read', error)
  }
  emitNotificationsChanged()
}

export async function addNotification(payload: AddNotificationPayload) {
  try {
    const res = await fetch(`${API_BASE}/api/notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      console.error('failed to add notification', await res.text())
    }
  } catch (error) {
    console.error('failed to add notification', error)
  }
  emitNotificationsChanged()
}

export function formatUnreadCount(count: number): string | null {
  if (count <= 0) return null
  return count > 99 ? '99+' : String(count)
}
