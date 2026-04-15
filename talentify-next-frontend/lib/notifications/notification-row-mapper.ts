import type { Database, Json } from '@/types/supabase'

type NotificationRow = Database['public']['Tables']['notifications']['Row']

export type NotificationQueryRow = {
  id: string
  user_id: string
  type: NotificationRow['type']
  data: Json | null
  title: string
  body: string | null
  is_read: boolean
  created_at: Date | null
  updated_at: Date | null
  read_at: Date | null
  priority: 'low' | 'medium' | 'high'
  action_url: string | null
  action_label: string | null
  entity_type: string | null
  entity_id: string | null
  actor_name: string | null
  expires_at: Date | null
  group_key: string | null
}

function resolvePriority(value: string | null): NotificationRow['priority'] {
  return value === 'low' || value === 'high' ? value : 'medium'
}

function toIsoString(value: Date | null | undefined): string | null {
  if (!value) return null
  return value.toISOString()
}

export function mapNotificationQueryRowToRow(row: NotificationQueryRow): NotificationRow {
  const rawData = row.data && typeof row.data === 'object' && !Array.isArray(row.data) ? row.data : null
  const createdAt = row.created_at ?? row.updated_at ?? row.read_at ?? new Date(0)
  const updatedAt = row.updated_at ?? row.created_at ?? createdAt

  return {
    id: row.id,
    user_id: row.user_id,
    type: row.type,
    data: row.data,
    title: row.title,
    body: row.body,
    is_read: row.is_read,
    created_at: createdAt.toISOString(),
    updated_at: updatedAt.toISOString(),
    read_at: toIsoString(row.read_at),
    priority: resolvePriority(row.priority ?? (typeof rawData?.priority === 'string' ? rawData.priority : null)),
    action_url: row.action_url ?? (typeof rawData?.url === 'string' ? rawData.url : null),
    action_label: row.action_label ?? (typeof rawData?.action_label === 'string' ? rawData.action_label : null),
    entity_type: row.entity_type ?? (typeof rawData?.entity_type === 'string' ? rawData.entity_type : null),
    entity_id: row.entity_id ?? (typeof rawData?.entity_id === 'string' ? rawData.entity_id : null),
    actor_name: row.actor_name ?? (typeof rawData?.actor_name === 'string' ? rawData.actor_name : null),
    expires_at: toIsoString(row.expires_at),
    group_key: row.group_key,
  }
}
