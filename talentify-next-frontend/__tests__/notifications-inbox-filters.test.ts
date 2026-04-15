import {
  buildNotificationCountFilter,
  buildNotificationListFilter,
  buildUnreadNotificationFilter,
} from '@/lib/notifications/inbox-filters'

describe('notifications inbox shared filters', () => {
  test('未読件数フィルタは常に is_read=false ベースになる', () => {
    expect(buildNotificationCountFilter({ unreadCountOnly: true })).toEqual({
      unreadCountOnly: true,
      unreadOnly: true,
    })
  })

  test('未読一覧フィルタは余計な条件を含めない', () => {
    expect(buildUnreadNotificationFilter()).toEqual({ unreadOnly: true })
    expect(
      buildNotificationListFilter({
        unreadOnly: true,
        actionableOnly: false,
        category: null,
      }),
    ).toEqual({ unreadOnly: true, actionableOnly: false })
  })

  test('不正 category は無視し、暗黙の category 注入をしない', () => {
    expect(
      buildNotificationListFilter({
        unreadOnly: true,
        actionableOnly: false,
        category: 'unknown',
      }),
    ).toEqual({ unreadOnly: true, actionableOnly: false })
  })
})
