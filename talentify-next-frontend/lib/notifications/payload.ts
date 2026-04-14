import type { Database } from '@/types/supabase'

type NotificationInsert = Database['public']['Tables']['notifications']['Insert']

export type RecipientRole = 'store' | 'talent' | 'company' | 'unknown'

type NotificationEvent =
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
    }

export type NotificationPayload = Omit<NotificationInsert, 'user_id'>

const DEFAULT_ACTOR_NAME = 'Talentify運営'

function normalizeActorName(actorName?: string | null): string {
  if (typeof actorName !== 'string') return DEFAULT_ACTOR_NAME
  const trimmed = actorName.trim()
  return trimmed.length > 0 ? trimmed : DEFAULT_ACTOR_NAME
}

function roleToRootPath(role: RecipientRole): string {
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

function buildBaseData(role: RecipientRole, actorName: string, category: 'announcement' | 'notification', isActionable: boolean) {
  return {
    recipient_role: role,
    actor_name: actorName,
    category,
    is_actionable: isActionable,
  }
}

export function buildNotificationPayload(event: NotificationEvent, recipientRole: RecipientRole): NotificationPayload {
  const notificationsRoot = getNotificationsRootPath(recipientRole)

  if (event.kind === 'message_received') {
    const actorName = normalizeActorName(event.actorName ?? 'お相手')
    const actionUrl = ensureSafeActionUrl(`${roleToRootPath(recipientRole)}/messages`, notificationsRoot)

    return {
      type: 'message',
      title: `${actorName}さんからメッセージが届きました`,
      body: '内容を確認して、必要であれば返信しましょう。',
      priority: 'high',
      action_url: actionUrl,
      action_label: 'メッセージを確認',
      entity_type: 'message',
      entity_id: event.messageId,
      actor_name: actorName,
      group_key: `message:${event.threadId}`,
      data: {
        ...buildBaseData(recipientRole, actorName, 'notification', true),
        thread_id: event.threadId,
        message_id: event.messageId,
        offer_id: event.offerId ?? null,
      },
    }
  }

  if (event.kind === 'invoice_submitted_to_store') {
    const actorName = normalizeActorName(event.actorName ?? '演者')
    const actionUrl = ensureSafeActionUrl(`${roleToRootPath(recipientRole)}/invoices/${event.invoiceId}`, notificationsRoot)

    return {
      type: 'invoice_submitted',
      title: '請求書が提出されました',
      body: '内容を確認して、承認または差し戻しを行ってください。',
      priority: 'medium',
      action_url: actionUrl,
      action_label: '請求書を確認',
      entity_type: 'invoice',
      entity_id: event.invoiceId,
      actor_name: actorName,
      group_key: `invoice:${event.invoiceId}`,
      data: {
        ...buildBaseData(recipientRole, actorName, 'notification', true),
        invoice_id: event.invoiceId,
      },
    }
  }

  if (event.kind === 'invoice_rejected_to_talent') {
    const actorName = normalizeActorName(event.actorName ?? '店舗')
    const actionUrl = ensureSafeActionUrl(`${roleToRootPath(recipientRole)}/invoices/${event.invoiceId}`, notificationsRoot)

    return {
      type: 'invoice_submitted',
      title: '請求書が差し戻されました',
      body: '修正内容を確認し、再提出をお願いします。',
      priority: 'high',
      action_url: actionUrl,
      action_label: '再提出する',
      entity_type: 'invoice',
      entity_id: event.invoiceId,
      actor_name: actorName,
      group_key: `invoice:${event.invoiceId}`,
      data: {
        ...buildBaseData(recipientRole, actorName, 'notification', true),
        invoice_id: event.invoiceId,
      },
    }
  }

  if (event.kind === 'payment_completed_to_talent') {
    const actorName = normalizeActorName(event.actorName ?? '店舗')
    const actionUrl = ensureSafeActionUrl(`${roleToRootPath(recipientRole)}/invoices/${event.invoiceId}`, notificationsRoot)

    return {
      type: 'payment_created',
      title: '支払いが完了しました',
      body: '支払い内容を確認し、必要に応じて明細をチェックしてください。',
      priority: 'medium',
      action_url: actionUrl,
      action_label: '明細を確認',
      entity_type: 'payment',
      entity_id: event.invoiceId,
      actor_name: actorName,
      group_key: `payment:${event.invoiceId}`,
      data: {
        ...buildBaseData(recipientRole, actorName, 'notification', false),
        invoice_id: event.invoiceId,
      },
    }
  }

  const actorName = normalizeActorName(event.actorName ?? '店舗')
  const actionUrl = ensureSafeActionUrl(`${roleToRootPath(recipientRole)}/reviews`, notificationsRoot)

  return {
    type: 'review_received',
    title: 'レビューが届きました',
    body: '内容を確認し、今後の案件に活かしましょう。',
    priority: 'low',
    action_url: actionUrl,
    action_label: 'レビューを見る',
    entity_type: 'review',
    entity_id: event.reviewId,
    actor_name: actorName,
    group_key: `review:${event.offerId}`,
    data: {
      ...buildBaseData(recipientRole, actorName, 'notification', false),
      offer_id: event.offerId,
      review_id: event.reviewId,
    },
  }
}
