import type { NotificationRow } from '@/utils/notifications'
import { isActionRequiredNotification } from '@/types/notifications'
import { getNotificationsRootPath, type RecipientRole } from '@/lib/notifications/payload'

function resolveRoleFromNotification(notification: NotificationRow): RecipientRole {
  const data = (notification.data as Record<string, unknown> | null) ?? {}
  const recipientRole = data.recipient_role
  if (recipientRole === 'store' || recipientRole === 'talent' || recipientRole === 'company') return recipientRole
  return 'unknown'
}

function resolveFallbackLink(notification: NotificationRow): string {
  return getNotificationsRootPath(resolveRoleFromNotification(notification))
}

export function getNotificationLink(notification: NotificationRow): string {
  if (notification.action_url && notification.action_url.startsWith('/')) return notification.action_url

  const data = (notification.data as Record<string, unknown> | null) ?? {}
  if (typeof data.url === 'string' && data.url.startsWith('/')) return data.url

  const offerId = typeof data.offer_id === 'string' ? data.offer_id : null
  const invoiceId = typeof data.invoice_id === 'string' ? data.invoice_id : null

  const role = resolveRoleFromNotification(notification)
  if (notification.type === 'message') return role === 'store' || role === 'talent' ? `/${role}/messages` : '/app/messages'
  if (offerId) {
    if (role === 'store' || role === 'talent') return `/${role}/offers/${offerId}`
    return `/offers/${offerId}`
  }
  if (invoiceId) return role === 'store' || role === 'talent' ? `/${role}/invoices/${invoiceId}` : `/invoices/${invoiceId}`
  return resolveFallbackLink(notification)
}

export function isActionRequired(notification: NotificationRow): boolean {
  const data = (notification.data as Record<string, unknown> | null) ?? {}
  if (typeof data.is_actionable === 'boolean') return data.is_actionable
  if (data.category === 'announcement' || notification.entity_type === 'announcement') return false
  if (notification.entity_type === 'announcement') return false
  if (isActionRequiredNotification(notification.type)) return true
  if (notification.type === 'offer_accepted') return false
  if (notification.type === 'offer_updated') {
    const status = typeof data.status === 'string' ? data.status.toLowerCase() : ''
    return ['pending', 'offer_created', 'submitted'].includes(status)
  }
  return notification.priority === 'high'
}

export function getActionLabel(notification: NotificationRow): string {
  if (notification.action_label) return notification.action_label
  if (notification.type === 'message') return '返信する'
  if (isActionRequired(notification)) return '確認する'
  return '詳細を見る'
}
