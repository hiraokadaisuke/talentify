import { Prisma } from '@prisma/client'
import { getPrismaClient } from '@/lib/prisma'
import type { Database } from '@/types/supabase'
import type { NotificationType } from '@/types/notifications'
import { mapNotificationQueryRowToRow, type NotificationQueryRow } from '@/lib/notifications/notification-row-mapper'

type NotificationRow = Database['public']['Tables']['notifications']['Row']
type NotificationInsert = Database['public']['Tables']['notifications']['Insert']

type CountUnreadNotificationsParams = {
  userId: string
  type?: NotificationType
  actionableOnly?: boolean
  category?: 'announcement' | 'notification'
  includeExpired?: boolean
}

type FindNotificationsByUserParams = {
  userId: string
  limit?: number
  unreadOnly?: boolean
  actionableOnly?: boolean
  category?: 'announcement' | 'notification'
  includeExpired?: boolean
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

type NotificationQueryFilter = {
  unreadOnly?: boolean
  actionableOnly?: boolean
  category?: 'announcement' | 'notification'
  includeExpired?: boolean
  type?: NotificationType
}

type NotificationsColumnAvailability = {
  priority: boolean
  action_url: boolean
  action_label: boolean
  entity_type: boolean
  entity_id: boolean
  actor_name: boolean
  expires_at: boolean
  group_key: boolean
}

const NOTIFICATIONS_OPTIONAL_COLUMNS = [
  'priority',
  'action_url',
  'action_label',
  'entity_type',
  'entity_id',
  'actor_name',
  'expires_at',
  'group_key',
] as const

let notificationsColumnAvailabilityCache: NotificationsColumnAvailability | null = null

async function getNotificationsColumnAvailability(): Promise<NotificationsColumnAvailability> {
  if (notificationsColumnAvailabilityCache) {
    return notificationsColumnAvailabilityCache
  }

  const prisma = getPrismaClient()
  const rows = await prisma.$queryRaw<Array<{ column_name: string }>>`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'notifications'
      AND column_name = ANY (${NOTIFICATIONS_OPTIONAL_COLUMNS}::text[])
  `

  const existing = new Set(rows.map((row) => row.column_name))
  notificationsColumnAvailabilityCache = {
    priority: existing.has('priority'),
    action_url: existing.has('action_url'),
    action_label: existing.has('action_label'),
    entity_type: existing.has('entity_type'),
    entity_id: existing.has('entity_id'),
    actor_name: existing.has('actor_name'),
    expires_at: existing.has('expires_at'),
    group_key: existing.has('group_key'),
  }

  const missingColumns = NOTIFICATIONS_OPTIONAL_COLUMNS.filter(
    (column) => !existing.has(column),
  )
  console.info('[notifications][repository] notifications schema introspection result', {
    columns: notificationsColumnAvailabilityCache,
    missingColumns,
  })
  if (missingColumns.length > 0) {
    console.warn('[notifications][repository] notifications schema is missing columns', {
      missingColumns,
    })
  }

  return notificationsColumnAvailabilityCache
}

function buildNotificationQueryClauses({
  unreadOnly,
  actionableOnly,
  category,
  includeExpired,
  type,
}: NotificationQueryFilter, columns: NotificationsColumnAvailability): Prisma.Sql[] {
  const conditions: Prisma.Sql[] = []

  if (unreadOnly) {
    conditions.push(Prisma.sql`is_read = false`)
  }

  if (actionableOnly) {
    conditions.push(Prisma.sql`(
      type = ANY (${ACTION_REQUIRED_TYPES}::public.notification_type[])
      OR COALESCE(
        CASE
          WHEN jsonb_typeof(data->'is_actionable') = 'boolean' THEN (data->>'is_actionable')::boolean
          ELSE NULL
        END,
        false
      ) = true
    )`)
  }

  if (category === 'announcement') {
    if (columns.entity_type) {
      conditions.push(Prisma.sql`(
        COALESCE(entity_type, '') = 'announcement'
        OR COALESCE(data->>'category', '') = 'announcement'
      )`)
    } else {
      conditions.push(Prisma.sql`COALESCE(data->>'category', '') = 'announcement'`)
    }
  }

  if (category === 'notification') {
    if (columns.entity_type) {
      conditions.push(Prisma.sql`(
        COALESCE(entity_type, '') != 'announcement'
        AND COALESCE(data->>'category', 'notification') = 'notification'
      )`)
    } else {
      conditions.push(Prisma.sql`COALESCE(data->>'category', 'notification') = 'notification'`)
    }
  }

  if (includeExpired === false && columns.expires_at) {
    conditions.push(Prisma.sql`(expires_at IS NULL OR expires_at > NOW())`)
  }

  if (type) {
    conditions.push(Prisma.sql`type = ${type}::public.notification_type`)
  }

  return conditions
}

function hasMissingNotificationColumns(columns: NotificationsColumnAvailability): boolean {
  return NOTIFICATIONS_OPTIONAL_COLUMNS.some((column) => !columns[column])
}

function buildNotificationsOrderByClause({
  columns,
  useFallbackQuery,
}: {
  columns: NotificationsColumnAvailability
  useFallbackQuery: boolean
}): Prisma.Sql {
  if (!useFallbackQuery && columns.priority) {
    return Prisma.sql`
      ORDER BY
        CASE priority
          WHEN 'high' THEN 2
          WHEN 'medium' THEN 1
          WHEN 'low' THEN 0
          ELSE 1
        END DESC,
        updated_at DESC,
        created_at DESC
    `
  }

  return Prisma.sql`ORDER BY updated_at DESC, created_at DESC`
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

export async function countUnreadNotificationsByUser({
  userId,
  type,
  actionableOnly,
  category,
  includeExpired,
}: CountUnreadNotificationsParams): Promise<number> {
  const prisma = getPrismaClient()
  const columns = await getNotificationsColumnAvailability()
  const conditions = buildNotificationQueryClauses(
    {
      unreadOnly: true,
      actionableOnly,
      category,
      includeExpired,
      type,
    },
    columns,
  )
  const whereClause = Prisma.sql`
    WHERE user_id = ${userId}
    ${conditions.length > 0 ? Prisma.sql`AND ${Prisma.join(conditions, ' AND ')}` : Prisma.empty}
  `

  const rows = await prisma.$queryRaw<Array<{ count: bigint | number }>>`
    SELECT COUNT(*)::bigint AS count
    FROM public.notifications
    ${whereClause}
  `
  const rawCount = rows[0]?.count
  const count = typeof rawCount === 'bigint' ? Number(rawCount) : Number(rawCount ?? 0)

  if (process.env.NOTIFICATIONS_DEBUG_LOG === 'true') {
    console.info('[notifications][repository][countUnread]', {
      userId,
      filter: {
        type: type ?? null,
        unreadOnly: true,
        actionableOnly: Boolean(actionableOnly),
        category: category ?? null,
        includeExpired: includeExpired !== false,
      },
      count,
    })
  }

  return count
}

export async function findNotificationsByUser({
  userId,
  limit,
  unreadOnly,
  actionableOnly,
  category,
  includeExpired,
}: FindNotificationsByUserParams): Promise<NotificationRow[]> {
  const prisma = getPrismaClient()
  const columns = await getNotificationsColumnAvailability()
  const useFallbackQuery = hasMissingNotificationColumns(columns)

  const limitClause =
    typeof limit === 'number' && Number.isFinite(limit) && limit > 0
      ? Prisma.sql`LIMIT ${Math.floor(limit)}`
      : Prisma.empty

  const conditions = buildNotificationQueryClauses(
    {
      unreadOnly,
      actionableOnly,
      category,
      includeExpired,
    },
    columns,
  )
  const whereClause = Prisma.sql`
    WHERE user_id = ${userId}
    ${conditions.length > 0 ? Prisma.sql`AND ${Prisma.join(conditions, ' AND ')}` : Prisma.empty}
  `
  const orderByClause = buildNotificationsOrderByClause({ columns, useFallbackQuery })

  if (useFallbackQuery) {
    console.warn('[notifications][repository] using fallback notifications list query due to missing columns')
  }

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
      ${
        columns.priority
          ? Prisma.sql`priority`
          : Prisma.sql`'medium'::text AS priority`
      },
      ${columns.action_url ? Prisma.sql`action_url` : Prisma.sql`NULL::text AS action_url`},
      ${columns.action_label ? Prisma.sql`action_label` : Prisma.sql`NULL::text AS action_label`},
      ${columns.entity_type ? Prisma.sql`entity_type` : Prisma.sql`NULL::text AS entity_type`},
      ${columns.entity_id ? Prisma.sql`entity_id` : Prisma.sql`NULL::text AS entity_id`},
      ${columns.actor_name ? Prisma.sql`actor_name` : Prisma.sql`NULL::text AS actor_name`},
      ${
        columns.expires_at
          ? Prisma.sql`expires_at`
          : Prisma.sql`NULL::timestamptz AS expires_at`
      },
      ${columns.group_key ? Prisma.sql`group_key` : Prisma.sql`NULL::text AS group_key`}
    FROM public.notifications
    ${whereClause}
    ${orderByClause}
    ${limitClause}
  `

  if (process.env.NOTIFICATIONS_DEBUG_LOG === 'true') {
    console.info('[notifications][repository][find]', {
      userId,
      filter: {
        unreadOnly: Boolean(unreadOnly),
        actionableOnly: Boolean(actionableOnly),
        category: category ?? null,
        includeExpired: includeExpired !== false,
      },
      resultCount: rows.length,
    })
  }

  return rows.map(mapNotificationQueryRowToRow)
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
      return mapNotificationQueryRowToRow(mergedRows[0])
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

  return mapNotificationQueryRowToRow(rows[0])
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
