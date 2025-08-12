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
  console.log('session uid=', user?.id)
  if (!user) return []

  let query = supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .in('type', ['offer_created', 'review_received'])
    .order('created_at', { ascending: false })

  if (limit) query = query.limit(limit)

  const { data, error } = await query
  if (error) {
    console.error('failed to fetch notifications', error)
    return []
  }
  return (data ?? []) as NotificationRow[]
}

export async function markNotificationRead(id: string) {
  await supabase
    .from('notifications')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('id', id)
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
