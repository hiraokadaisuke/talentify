'use client'
import { createClient } from '@/utils/supabase/client'
import type { Database } from '@/types/supabase'

const supabase = createClient()

export type NotificationRow = Database['public']['Tables']['notifications']['Row']
export type NotificationInsert = Database['public']['Tables']['notifications']['Insert']

export async function getNotifications(limit?: number): Promise<NotificationRow[]> {
  const { data: { user } } = await supabase.auth.getUser()
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
  return data as NotificationRow[]
}

export async function markNotificationRead(id: string) {
  await supabase
    .from('notifications')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('id', id)
}

export async function addNotification(payload: NotificationInsert) {
  const { error } = await supabase.from('notifications').insert(payload)
  if (error) {
    console.error('failed to add notification', error)
  }
}
