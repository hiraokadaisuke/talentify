import type { ReactElement } from 'react'
import DashboardNotificationsPage from '@/app/(dashboard)/notifications/page'
import StoreNotificationsPage from '@/app/store/notifications/page'
import TalentNotificationsPage from '@/app/talent/notifications/page'
import NotificationsInboxPage from '@/components/notifications/NotificationsInboxPage'

describe('notifications page wiring', () => {
  test('talent/store/dashboard すべて同じ NotificationsInboxPage を使用する', () => {
    expect((TalentNotificationsPage() as ReactElement).type).toBe(NotificationsInboxPage)
    expect((StoreNotificationsPage() as ReactElement).type).toBe(NotificationsInboxPage)
    expect((DashboardNotificationsPage() as ReactElement).type).toBe(NotificationsInboxPage)
  })
})
