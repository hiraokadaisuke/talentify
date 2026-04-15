import { Prisma } from '@prisma/client'
import { getPrismaClient } from '@/lib/prisma'
import type { Database, Json } from '@/types/supabase'
import type { NotificationType } from '@/types/notifications'

type NotificationRow = Database['public']['Tables']['notifications']['Row']
type NotificationInsert = Database['public']['Tables']['notifications']['Insert']

type CountUnreadNotificationsParams = {
  userId: string
  type?: NotificationType
}

type FindNotificationsByUserParams = {
  userId: string
  limit?: number
  unreadOnly?: boolean
  actionableOnly?: boolean
  category?: 'announcement' | 'notification'
}

type MarkNotificationReadParams = {
  id: string
  userId: string
}

type MarkNotificationUnreadParams = {
  id: string
  userId: string
}

type MarkAllNotificationsReadParams = {
  userId: string
  ids?: string[]
}

const ACTION_REQUIRED_TYPES: NotificationType[] = [
  'message',
  'offer_created',
  'offer_updated',
  'invoice_submitted',
]

type NotificationQueryRow = {
  id: string
  user_id: string
  type: NotificationRow['type']
  data: Json | null
  title: string
  body: string | null
  is_read: boolean
  created_at: Date
  updated_at: Date
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

export async function findNotificationOwner({
  id,
  userId,
}: {
  id: string
  userId: string
}): Promise<boolean> {
  const prisma = getPrismaClient()
  const row = await prisma.notifications.findFirst({
    where: {
      id,
      user_id: userId,
    },
    select: { id: true },
  })

  return Boolean(row)
}

function resolvePriority(value: string | null): NotificationRow['priority'] {
  return value === 'low' || value === 'high' ? value : 'medium'
}

function toNotificationRow(row: NotificationQueryRow): NotificationRow {
  const rawData = row.data && typeof row.data === 'object' && !Array.isArray(row.data) ? row.data : null

  return {
    id: row.id,
    user_id: row.user_id,
    type: row.type,
    data: row.data,
    title: row.title,
    body: row.body,
    is_read: row.is_read,
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
    read_at: row.read_at?.toISOString() ?? null,
    priority: resolvePriority(row.priority ?? (typeof rawData?.priority === 'string' ? rawData.priority : null)),
    action_url: row.action_url ?? (typeof rawData?.url === 'string' ? rawData.url : null),
    action_label: row.action_label ?? (typeof rawData?.action_label === 'string' ? rawData.action_label : null),
    entity_type: row.entity_type ?? (typeof rawData?.entity_type === 'string' ? rawData.entity_type : null),
    entity_id: row.entity_id ?? (typeof rawData?.entity_id === 'string' ? rawData.entity_id : null),
    actor_name: row.actor_name ?? (typeof rawData?.actor_name === 'string' ? rawData.actor_name : null),
    expires_at: row.expires_at?.toISOString() ?? null,
    group_key: row.group_key,
  }
}

export async function countUnreadNotificationsByUser({
  userId,
  type,
}: CountUnreadNotificationsParams): Promise<number> {
  const prisma = getPrismaClient()

  const count = await prisma.notifications.count({
    where: {
      user_id: userId,
      is_read: false,
      ...(type ? { type } : {}),
    },
  })

  return count
}

export async function findNotificationsByUser({
  userId,
  limit,
  unreadOnly,
  actionableOnly,
  category,
}: FindNotificationsByUserParams): Promise<NotificationRow[]> {
  const prisma = getPrismaClient()

  const limitClause =
    typeof limit === 'number' && Number.isFinite(limit) && limit > 0
      ? Prisma.sql`LIMIT ${Math.floor(limit)}`
      : Prisma.empty

  const unreadClause = unreadOnly ? Prisma.sql`AND is_read = false` : Prisma.empty

  const actionableClause = actionableOnly
    ? Prisma.sql`AND (
      type = ANY (${ACTION_REQUIRED_TYPES}::public.notification_type[])
      OR COALESCE(
        CASE
          WHEN jsonb_typeof(data->'is_actionable') = 'boolean' THEN (data->>'is_actionable')::boolean
          ELSE NULL
        END,
        false
      ) = true
    )`
    : Prisma.empty

  const categoryClause =
    category === 'announcement'
      ? Prisma.sql`AND (
          COALESCE(entity_type, '') = 'announcement'
          OR COALESCE(data->>'category', '') = 'announcement'
        )`
      : category === 'notification'
        ? Prisma.sql`AND (
            COALESCE(entity_type, '') != 'announcement'
            AND COALESCE(data->>'category', 'notification') = 'notification'
          )`
        : Prisma.empty

  const rows = await prisma.$queryRaw<NotificationQueryRow[]>`
    SELECT
      id,
      user_id,
      type::text,
      data,
      title,
      body,
      is_read,
      created_at,
      updated_at,
      read_at,
      priority,
      action_url,
      action_label,
      entity_type,
      entity_id,
      actor_name,
      expires_at,
      group_key
    FROM public.notifications
    WHERE user_id = ${userId}
    ${unreadClause}
    ${actionableClause}
    ${categoryClause}
    ORDER BY updated_at DESC, created_at DESC
    ${limitClause}
  `

  if (process.env.NOTIFICATIONS_DEBUG_LOG === 'true') {
    console.info('[notifications][repository][find]', {
      userId,
      filter: { unreadOnly: Boolean(unreadOnly), actionableOnly: Boolean(actionableOnly), category: category ?? null },
      resultCount: rows.length,
    })
  }

  return rows.map(toNotificationRow)
}

export async function createNotification({
  user_id,
  type,
  title,
  body,
  data,
  priority,
  action_url,
  action_label,
  entity_type,
  entity_id,
  actor_name,
  expires_at,
  group_key,
}: NotificationInsert): Promise<NotificationRow> {
  const prisma = getPrismaClient()
  const now = new Date()

  if (group_key) {
    const mergedRows = await prisma.$queryRaw<NotificationQueryRow[]>`
      WITH candidate AS (
        SELECT id
        FROM public.notifications
        WHERE user_id = ${user_id}::uuid
          AND type = ${type}
          AND group_key = ${group_key}
          AND is_read = false
          AND (
            (${entity_id ?? null}::text IS NULL AND entity_id IS NULL)
            OR entity_id = ${entity_id ?? null}
          )
        ORDER BY updated_at DESC, created_at DESC
        LIMIT 1
      )
      UPDATE public.notifications
      SET
        title = ${title},
        body = ${body ?? null},
        data = ${data ?? null}::jsonb,
        priority = ${priority ?? 'medium'},
        action_url = ${action_url ?? null},
        action_label = ${action_label ?? null},
        entity_type = ${entity_type ?? null},
        entity_id = ${entity_id ?? null},
        actor_name = ${actor_name ?? null},
        expires_at = ${expires_at ?? null},
        updated_at = ${now},
        read_at = NULL,
        is_read = false
      WHERE id IN (SELECT id FROM candidate)
      RETURNING
        id,
        user_id,
        type::text,
        data,
        title,
        body,
        is_read,
        created_at,
        updated_at,
        read_at,
        priority,
        action_url,
        action_label,
        entity_type,
        entity_id,
        actor_name,
        expires_at,
        group_key
    `

    if (mergedRows.length > 0) {
      return toNotificationRow(mergedRows[0])
    }
  }

  const rows = await prisma.$queryRaw<NotificationQueryRow[]>`
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      body,
      data,
      created_at,
      updated_at,
      priority,
      action_url,
      action_label,
      entity_type,
      entity_id,
      actor_name,
      expires_at,
      group_key
    )
    VALUES (
      ${user_id}::uuid,
      ${type},
      ${title},
      ${body ?? null},
      ${data ?? null}::jsonb,
      ${now},
      ${now},
      ${priority ?? 'medium'},
      ${action_url ?? null},
      ${action_label ?? null},
      ${entity_type ?? null},
      ${entity_id ?? null},
      ${actor_name ?? null},
      ${expires_at ?? null},
      ${group_key ?? null}
    )
    RETURNING
      id,
      user_id,
      type::text,
      data,
      title,
      body,
      is_read,
      created_at,
      updated_at,
      read_at,
      priority,
      action_url,
      action_label,
      entity_type,
      entity_id,
      actor_name,
      expires_at,
      group_key
  `

  if (rows.length === 0) {
    throw new Error('failed to insert notification')
  }

  return toNotificationRow(rows[0])
}

export async function markNotificationRead({
  id,
  userId,
}: MarkNotificationReadParams): Promise<number> {
  const prisma = getPrismaClient()
  const now = new Date()

  const result = await prisma.notifications.updateMany({
    where: {
      id,
      user_id: userId,
      is_read: false,
    },
    data: {
      is_read: true,
      read_at: now,
      updated_at: now,
    },
  })

  return result.count
}

export async function markNotificationUnread({
  id,
  userId,
}: MarkNotificationUnreadParams): Promise<number> {
  const prisma = getPrismaClient()

  const result = await prisma.notifications.updateMany({
    where: {
      id,
      user_id: userId,
      is_read: true,
    },
    data: {
      is_read: false,
      read_at: null,
      updated_at: new Date(),
    },
  })

  return result.count
}

export async function markAllNotificationsRead({
  userId,
  ids,
}: MarkAllNotificationsReadParams): Promise<number> {
  const prisma = getPrismaClient()
  const now = new Date()

  const idFilter =
    Array.isArray(ids) && ids.length > 0
      ? { id: { in: ids } }
      : {}

  const result = await prisma.notifications.updateMany({
    where: {
      user_id: userId,
      ...idFilter,
      is_read: false,
    },
    data: {
      is_read: true,
      read_at: now,
      updated_at: now,
    },
  })

  return result.count
}
