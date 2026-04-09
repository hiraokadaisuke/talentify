import type { Database } from '@/types/supabase'

export type NotificationType = Database['public']['Enums']['notification_type']

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

export function isNotificationType(value: unknown): value is NotificationType {
  return typeof value === 'string' && NOTIFICATION_TYPES.includes(value as NotificationType)
}
