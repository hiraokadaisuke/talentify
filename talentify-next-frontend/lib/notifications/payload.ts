import type { Database } from '@/types/supabase'
import { notificationConfig, type NotificationEvent } from './config'

type NotificationInsert = Database['public']['Tables']['notifications']['Insert']

export type RecipientRole = 'store' | 'talent' | 'company' | 'unknown'

export type NotificationPayload = Omit<NotificationInsert, 'user_id'>

const DEFAULT_ACTOR_NAME = 'Talentify運営'

function normalizeActorName(actorName?: string | null): string {
  if (typeof actorName !== 'string') return DEFAULT_ACTOR_NAME
  const trimmed = actorName.trim()
  return trimmed.length > 0 ? trimmed : DEFAULT_ACTOR_NAME
}

export function roleToRootPath(role: RecipientRole): string {
  if (role === 'store') return '/store'
  if (role === 'talent') return '/talent'
  if (role === 'company') return '/app'
  return '/app'
}

export function getNotificationsRootPath(role: RecipientRole): string {
  return `${roleToRootPath(role)}/notifications`
}

function ensureSafeActionUrl(actionUrl: string | null | undefined, fallbackPath: string): string {
  if (!actionUrl || typeof actionUrl !== 'string') return fallbackPath
  if (!actionUrl.startsWith('/')) return fallbackPath
  return actionUrl
}

export function buildNotificationPayload(event: NotificationEvent, recipientRole: RecipientRole): NotificationPayload {
  const actorName = normalizeActorName(event.actorName)
  const roleRootPath = roleToRootPath(recipientRole)
  const notificationsRoot = getNotificationsRootPath(recipientRole)

  const config = notificationConfig[event.kind]
  const built = (config.build as (ctx: {
    actorName: string
    recipientRole: RecipientRole
    roleRootPath: string
    notificationsRoot: string
    event: NotificationEvent
  }) => {
    title: string
    body: string
    actionUrl: string | null
    actionLabel: string | null
    entityType: string | null
    entityId: string | null
    data: Record<string, unknown>
  })({
    actorName,
    recipientRole,
    roleRootPath,
    notificationsRoot,
    event,
  })

  return {
    type: config.type,
    title: built.title,
    body: built.body,
    priority: config.priority,
    action_url: ensureSafeActionUrl(built.actionUrl, notificationsRoot),
    action_label: built.actionLabel,
    entity_type: built.entityType,
    entity_id: built.entityId,
    actor_name: actorName,
    group_key: (config.dedupeStrategy as (input: NotificationEvent) => string | null)(event),
    data: {
      recipient_role: recipientRole,
      actor_name: actorName,
      category: config.category,
      is_actionable: config.isActionable,
      ...built.data,
    },
  }
}
