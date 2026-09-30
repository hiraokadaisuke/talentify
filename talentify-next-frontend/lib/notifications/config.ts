import type { NotificationType } from '@/types/notifications'
import type { RecipientRole } from './payload'

export type NotificationEvent =
  | {
      kind: 'message_received'
      actorName?: string | null
      actorId?: string | null
      threadId: string
      messageId: string
      offerId?: string | null
    }
  | {
      kind: 'invoice_submitted_to_store'
      actorName?: string | null
      actorId?: string | null
      invoiceId: string
    }
  | {
      kind: 'invoice_rejected_to_talent'
      actorName?: string | null
      actorId?: string | null
      invoiceId: string
    }
  | {
      kind: 'payment_completed_to_talent'
      actorName?: string | null
      actorId?: string | null
      invoiceId: string
    }
  | {
      kind: 'review_received'
      actorName?: string | null
      actorId?: string | null
      reviewId: string
      offerId: string
    }
  | {
      kind: 'offer_created'
      actorName?: string | null
      actorId?: string | null
      offerId: string
    }
  | {
      kind: 'offer_updated'
      actorName?: string | null
      actorId?: string | null
      offerId: string
      status?: string | null
    }
  | {
      kind: 'offer_accepted'
      actorName?: string | null
      actorId?: string | null
      offerId: string
    }

type NotificationCategory = 'announcement' | 'notification'

type BuildContext<E extends NotificationEvent> = {
  actorName: string
  recipientRole: RecipientRole
  roleRootPath: string
  notificationsRoot: string
  event: E
}

type NotificationConfig<E extends NotificationEvent = NotificationEvent> = {
  type: NotificationType
  category: NotificationCategory
  isActionable: boolean
  priority: 'low' | 'medium' | 'high'
  dedupeStrategy: (event: E) => string | null
  build: (
    ctx: BuildContext<E>,
  ) => {
    title: string
    body: string
    actionUrl: string | null
    actionLabel: string | null
    entityType: string | null
    entityId: string | null
    data: Record<string, unknown>
  }
}

export const notificationConfig: {
  [K in NotificationEvent['kind']]: NotificationConfig<Extract<NotificationEvent, { kind: K }>>
} = {
  message_received: {
    type: 'message',
    category: 'notification',
    isActionable: true,
    priority: 'high',
    dedupeStrategy: (event) => `message:${event.threadId}`,
    build: ({ actorName, roleRootPath, event }) => ({
      title: `${actorName}さんからメッセージが届きました`,
      body: '内容を確認して、必要であれば返信しましょう。',
      actionUrl: `${roleRootPath}/messages`,
      actionLabel: 'メッセージを確認',
      entityType: 'message',
      entityId: event.messageId,
      data: {
        thread_id: event.threadId,
        message_id: event.messageId,
        offer_id: event.offerId ?? null,
      },
    }),
  },
  invoice_submitted_to_store: {
    type: 'invoice_submitted',
    category: 'notification',
    isActionable: true,
    priority: 'medium',
    dedupeStrategy: (event) => `invoice-submit:${event.invoiceId}`,
    build: ({ roleRootPath, event }) => ({
      title: '請求書が提出されました',
      body: '内容を確認して、承認または差し戻しを行ってください。',
      actionUrl: `${roleRootPath}/invoices/${event.invoiceId}`,
      actionLabel: '請求書を確認',
      entityType: 'invoice',
      entityId: event.invoiceId,
      data: {
        invoice_id: event.invoiceId,
      },
    }),
  },
  invoice_rejected_to_talent: {
    type: 'invoice_submitted',
    category: 'notification',
    isActionable: true,
    priority: 'high',
    dedupeStrategy: (event) => `invoice-reject:${event.invoiceId}`,
    build: ({ roleRootPath, event }) => ({
      title: '請求書が差し戻されました',
      body: '修正内容を確認し、再提出をお願いします。',
      actionUrl: `${roleRootPath}/invoices/${event.invoiceId}`,
      actionLabel: '再提出する',
      entityType: 'invoice',
      entityId: event.invoiceId,
      data: {
        invoice_id: event.invoiceId,
      },
    }),
  },
  payment_completed_to_talent: {
    type: 'payment_created',
    category: 'notification',
    isActionable: false,
    priority: 'medium',
    dedupeStrategy: (event) => `invoice-pay:${event.invoiceId}`,
    build: ({ roleRootPath, event }) => ({
      title: '支払いが完了しました',
      body: '支払い内容を確認し、必要に応じて明細をチェックしてください。',
      actionUrl: `${roleRootPath}/invoices/${event.invoiceId}`,
      actionLabel: '明細を確認',
      entityType: 'payment',
      entityId: event.invoiceId,
      data: {
        invoice_id: event.invoiceId,
      },
    }),
  },
  review_received: {
    type: 'review_received',
    category: 'notification',
    isActionable: false,
    priority: 'low',
    dedupeStrategy: (event) => `review:${event.offerId}`,
    build: ({ roleRootPath, event }) => ({
      title: 'レビューが届きました',
      body: '内容を確認し、今後の案件に活かしましょう。',
      actionUrl: `${roleRootPath}/reviews`,
      actionLabel: 'レビューを見る',
      entityType: 'review',
      entityId: event.reviewId,
      data: {
        offer_id: event.offerId,
        review_id: event.reviewId,
      },
    }),
  },
  offer_created: {
    type: 'offer_created',
    category: 'notification',
    isActionable: true,
    priority: 'high',
    dedupeStrategy: (event) => `offer-created:${event.offerId}`,
    build: ({ roleRootPath, event }) => ({
      title: '新しいオファーが届きました',
      body: '内容を確認して、回答をお願いします。',
      actionUrl: `${roleRootPath}/offers/${event.offerId}`,
      actionLabel: 'オファーを確認',
      entityType: 'offer',
      entityId: event.offerId,
      data: {
        offer_id: event.offerId,
      },
    }),
  },
  offer_updated: {
    type: 'offer_updated',
    category: 'notification',
    isActionable: true,
    priority: 'medium',
    dedupeStrategy: (event) => `offer-updated:${event.offerId}:${event.status ?? 'unknown'}`,
    build: ({ roleRootPath, event }) => ({
      title: 'オファーのステータスが更新されました',
      body: event.status ? `現在のステータス: ${event.status}` : '最新状態を確認してください。',
      actionUrl: `${roleRootPath}/offers/${event.offerId}`,
      actionLabel: 'オファー詳細を見る',
      entityType: 'offer',
      entityId: event.offerId,
      data: {
        offer_id: event.offerId,
        status: event.status ?? null,
      },
    }),
  },
  offer_accepted: {
    type: 'offer_accepted',
    category: 'notification',
    isActionable: false,
    priority: 'medium',
    dedupeStrategy: (event) => `offer-accepted:${event.offerId}`,
    build: ({ roleRootPath, event }) => ({
      title: 'オファーが承認されました',
      body: '進行中の作業内容を確認してください。',
      actionUrl: `${roleRootPath}/offers/${event.offerId}`,
      actionLabel: 'オファーを見る',
      entityType: 'offer',
      entityId: event.offerId,
      data: {
        offer_id: event.offerId,
      },
    }),
  },
}
