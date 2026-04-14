import type { NotificationRow } from '@/utils/notifications'
import { isActionRequiredNotification } from '@/types/notifications'

export function getNotificationLink(notification: NotificationRow): string {
  if (notification.action_url) return notification.action_url

  const data = (notification.data as Record<string, unknown> | null) ?? {}
  if (typeof data.url === 'string') return data.url

  const offerId = typeof data.offer_id === 'string' ? data.offer_id : null
  const invoiceId = typeof data.invoice_id === 'string' ? data.invoice_id : null

  if (notification.type === 'message') return '/messages'
  if (offerId) return `/offers/${offerId}`
  if (invoiceId) return `/invoices/${invoiceId}`
  return '/notifications'
}

export function isActionRequired(notification: NotificationRow): boolean {
  if (notification.entity_type === 'announcement') return false
  if (notification.priority === 'high') return true
  return isActionRequiredNotification(notification.type)
}

export function getActionLabel(notification: NotificationRow): string {
  if (notification.action_label) return notification.action_label
  if (notification.type === 'message') return '返信する'
  if (isActionRequired(notification)) return '確認する'
  return '詳細を見る'
}
