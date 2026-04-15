import type { GetNotificationsOptions } from '@/utils/notifications'

export type NotificationInboxTab = 'all' | 'unread' | 'action_required' | 'announcement'

export function buildNotificationFilter(tab: NotificationInboxTab): GetNotificationsOptions {
  switch (tab) {
    case 'unread':
      return { unreadOnly: true }
    case 'action_required':
      return { actionableOnly: true }
    case 'announcement':
      return { category: 'announcement' }
    case 'all':
    default:
      return {}
  }
}
