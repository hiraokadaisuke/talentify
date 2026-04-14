import { createNotification } from '@/lib/repositories/notifications'
import { buildNotificationPayload, type RecipientRole } from './payload'
import type { NotificationEvent } from './config'
import { resolveActorName, resolveRecipientRole } from './resolve-recipient-role'

export async function createActionableNotification(
  recipientUserId: string,
  event: NotificationEvent,
  recipientRole?: RecipientRole,
) {
  const resolvedRole = await resolveRecipientRole({
    entityType: (() => {
      if (event.kind === 'message_received') return 'message'
      if (event.kind === 'review_received') return 'review'
      if (event.kind === 'payment_completed_to_talent') return 'payment'
      return 'invoice'
    })(),
    entityId:
      event.kind === 'message_received'
        ? event.messageId
        : event.kind === 'review_received'
          ? event.reviewId
          : event.invoiceId,
    actorId: event.actorId,
  })
  const finalRecipientRole = resolvedRole === 'unknown' ? (recipientRole ?? 'unknown') : resolvedRole

  const resolvedActorName = await resolveActorName({
    actorId: event.actorId,
    fallbackName: event.actorName,
  })

  const payload = buildNotificationPayload(
    {
      ...event,
      actorName: resolvedActorName,
    },
    finalRecipientRole,
  )

  return createNotification({
    user_id: recipientUserId,
    ...payload,
  })
}
