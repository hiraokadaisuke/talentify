import type { Database } from '@/types/supabase'

export type NotificationType = Database['public']['Tables']['notifications']['Row']['type']

export const NOTIFICATION_TYPES: NotificationType[] = [
  'offer_created',
  'offer_updated',
  'payment_created',
  'invoice_submitted',
  'review_received',
  'message_received',
  'message',
  'offer',
  'offer_accepted',
  'schedule_fixed',
]
