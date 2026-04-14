import type { Database } from '@/types/supabase'

export type NotificationType = Database['public']['Enums']['notification_type']
export type NotificationPriority = 'low' | 'medium' | 'high'
export type NotificationEntityType = 'offer' | 'message' | 'navigation' | 'review' | 'invoice' | 'payment' | 'announcement' | 'other'

export const NOTIFICATION_TYPES = [
  'offer_created',
  'offer_updated',
  'payment_created',
  'invoice_submitted',
  'review_received',
  'message',
  'offer',
  'offer_accepted',
  'schedule_fixed',
] as const satisfies readonly NotificationType[]

export const ACTION_REQUIRED_NOTIFICATION_TYPES = [
  'message',
  'offer_created',
  'offer_updated',
  'invoice_submitted',
] as const satisfies readonly NotificationType[]

export function isNotificationType(value: unknown): value is NotificationType {
  return typeof value === 'string' && NOTIFICATION_TYPES.includes(value as NotificationType)
}

export function isActionRequiredNotification(type: NotificationType): boolean {
  return (ACTION_REQUIRED_NOTIFICATION_TYPES as readonly NotificationType[]).includes(type)
}
