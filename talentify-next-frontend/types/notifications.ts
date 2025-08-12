import type { Database } from '@/types/supabase'

export type NotificationType = Database['public']['Tables']['notifications']['Row']['type']

export const NOTIFICATION_TYPES: NotificationType[] = [
  'offer',
  'offer_created',
  'offer_updated',
  'offer_accepted',
  'schedule_fixed',
  'contract_uploaded',
  'contract_checked',
  'payment_created',
  'invoice_submitted',
  'payment_completed',
  'review_received',
  'message',
]
