import { buildNotificationFilter } from '@/components/notifications/notification-filters'

describe('buildNotificationFilter', () => {
  test('未読タブは is_read=false のみで絞り込む', () => {
    expect(buildNotificationFilter('unread')).toEqual({ unreadOnly: true })
  })

  test('要対応タブは actionable のみで絞り込む', () => {
    expect(buildNotificationFilter('action_required')).toEqual({ actionableOnly: true })
  })

  test('お知らせタブは category=announcement で絞り込む', () => {
    expect(buildNotificationFilter('announcement')).toEqual({ category: 'announcement' })
  })

  test('すべてタブは追加条件なし', () => {
    expect(buildNotificationFilter('all')).toEqual({})
  })
})
