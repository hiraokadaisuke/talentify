import type { NotificationEvent } from '@/lib/notifications/config'
import type { RecipientRole } from '@/lib/notifications/payload'

export type EmitNotificationInput = {
  recipientUserId: string
  event: NotificationEvent
  recipientRole?: RecipientRole
}

/**
 * Centralized notification emit entrypoint.
 *
 * Policy:
 * - offer_created emits only on initial offer creation.
 * - offer status changes emit offer_updated / offer_accepted, never offer_created.
 */
export async function emitNotification({ recipientUserId, event, recipientRole }: EmitNotificationInput) {
  const { createActionableNotification } = await import('@/lib/notifications/service')
  return createActionableNotification(recipientUserId, event, recipientRole)
}
