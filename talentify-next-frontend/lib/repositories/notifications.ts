import { Prisma, type notification_type } from '@prisma/client'
import { getPrismaClient } from '@/lib/prisma'
import type { Database, Json } from '@/types/supabase'

type NotificationRow = Database['public']['Tables']['notifications']['Row']

type CountUnreadNotificationsParams = {
  userId: string
  type?: notification_type
}

type FindNotificationsByUserParams = {
  userId: string
  limit?: number
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

type NotificationQueryRow = {
  id: string
  user_id: string
  type: NotificationRow['type']
  data: Json | null
  title: string
  body: string | null
  is_read: boolean
  created_at: Date
  read_at: Date | null
}

type OfferVisibilityQueryRow = {
  id: string
  status: string | null
  accepted_at: Date | null
}

function toNotificationRow(row: NotificationQueryRow): NotificationRow {
  return {
    id: row.id,
    user_id: row.user_id,
    type: row.type,
    data: row.data,
    title: row.title,
    body: row.body,
    is_read: row.is_read,
    created_at: row.created_at.toISOString(),
    read_at: row.read_at?.toISOString() ?? null,
  }
}

function getOfferId(data: Json | null): string | null {
  if (!data || Array.isArray(data) || typeof data !== 'object') return null
  const offerId = data.offer_id
  return typeof offerId === 'string' ? offerId : null
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
}: FindNotificationsByUserParams): Promise<NotificationRow[]> {
  const prisma = getPrismaClient()

  const limitClause =
    typeof limit === 'number' && Number.isFinite(limit) && limit > 0
      ? Prisma.sql`LIMIT ${Math.floor(limit)}`
      : Prisma.empty

  const rows = await prisma.$queryRaw<NotificationQueryRow[]>`
    SELECT id, user_id, type::text, data, title, body, is_read, created_at, read_at
    FROM public.notifications
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
    ${limitClause}
  `

  if (rows.length === 0) {
    return []
  }

  const offerIds = rows
    .map((row) => getOfferId(row.data))
    .filter((offerId): offerId is string => typeof offerId === 'string')

  if (offerIds.length === 0) {
    return rows.map(toNotificationRow)
  }

  const offers = await prisma.$queryRaw<OfferVisibilityQueryRow[]>`
    SELECT id, status::text, accepted_at
    FROM public.offers
    WHERE id = ANY (${offerIds}::uuid[])
  `

  const hiddenOfferIds = new Set(
    offers.filter((offer) => offer.status === 'canceled' && !offer.accepted_at).map((offer) => offer.id)
  )

  if (hiddenOfferIds.size === 0) {
    return rows.map(toNotificationRow)
  }

  return rows
    .filter((row) => {
      const offerId = getOfferId(row.data)
      return !offerId || !hiddenOfferIds.has(offerId)
    })
    .map(toNotificationRow)
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
    },
    data: {
      is_read: true,
      read_at: now,
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
    },
    data: {
      is_read: false,
      read_at: null,
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
    },
  })

  return result.count
}
