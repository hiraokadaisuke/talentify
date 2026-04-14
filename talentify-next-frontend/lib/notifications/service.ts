import { createNotification } from '@/lib/repositories/notifications'
import { buildNotificationPayload, type RecipientRole } from './payload'

export async function createActionableNotification(
  recipientUserId: string,
  event:
    | {
        kind: 'message_received'
        actorName?: string | null
        threadId: string
        messageId: string
        offerId?: string | null
      }
    | {
        kind: 'invoice_submitted_to_store'
        actorName?: string | null
        invoiceId: string
      }
    | {
        kind: 'invoice_rejected_to_talent'
        actorName?: string | null
        invoiceId: string
      }
    | {
        kind: 'payment_completed_to_talent'
        actorName?: string | null
        invoiceId: string
      }
    | {
        kind: 'review_received'
        actorName?: string | null
        reviewId: string
        offerId: string
      },
  recipientRole: RecipientRole,
) {
  const payload = buildNotificationPayload(event, recipientRole)
  return createNotification({
    user_id: recipientUserId,
    ...payload,
  })
}
