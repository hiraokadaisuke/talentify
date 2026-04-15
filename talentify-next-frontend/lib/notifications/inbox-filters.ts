export type NotificationCategoryFilter = 'announcement' | 'notification'

export type NotificationListFilter = {
  unreadOnly: boolean
  actionableOnly: boolean
  category?: NotificationCategoryFilter
}

export function buildUnreadNotificationFilter(): Pick<NotificationListFilter, 'unreadOnly'> {
  return { unreadOnly: true }
}

export function buildNotificationListFilter(input: {
  unreadOnly?: boolean
  actionableOnly?: boolean
  category?: string | null
}): NotificationListFilter {
  const category =
    input.category === 'announcement' || input.category === 'notification' ? input.category : undefined

  return {
    unreadOnly: input.unreadOnly === true,
    actionableOnly: input.actionableOnly === true,
    ...(category ? { category } : {}),
  }
}

export function buildNotificationCountFilter(input: { unreadCountOnly?: boolean }) {
  return {
    unreadCountOnly: input.unreadCountOnly === true,
    unreadOnly: true as const,
  }
}
