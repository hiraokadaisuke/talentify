import type { NotificationRow } from '@/utils/notifications'

test('getNotifications fetches notifications from API', async () => {
  const mockData: NotificationRow[] = [
    {
      id: '1',
      user_id: 'user1',
      type: 'offer_created',
      title: 'offer',
      body: 'body',
      created_at: '2024-01-01T00:00:00.000Z',
      is_read: false,
      data: null,
      read_at: null,
      priority: 'medium',
      action_url: null,
      action_label: null,
      entity_type: null,
      entity_id: null,
      actor_name: null,
      expires_at: null,
      group_key: null,
    },
    {
      id: '2',
      user_id: 'user1',
      type: 'review_received',
      title: 'review',
      body: 'body',
      created_at: '2023-01-01T00:00:00.000Z',
      is_read: true,
      data: { rating: 5 },
      read_at: '2023-01-02T00:00:00.000Z',
      priority: 'medium',
      action_url: null,
      action_label: null,
      entity_type: null,
      entity_id: null,
      actor_name: null,
      expires_at: null,
      group_key: null,
    },
  ]

  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ data: mockData }),
  } as Response)

  const { getNotifications } = await import('@/utils/notifications')
  const data = await getNotifications(5)

  expect(data).toHaveLength(2)
  expect(global.fetch).toHaveBeenCalledWith('/api/notifications?limit=5')
})

test('getNotifications builds unread-only query without actionable/category constraints', async () => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ data: [] }),
  } as Response)

  const { getNotifications } = await import('@/utils/notifications')
  await getNotifications({ unreadOnly: true })

  expect(global.fetch).toHaveBeenCalledWith('/api/notifications?unread_only=true')
})

test('getNotifications returns unread offer_created/payment_created even when not actionable', async () => {
  const mockData: NotificationRow[] = [
    {
      id: 'offer-1',
      user_id: 'user1',
      type: 'offer_created',
      title: 'offer',
      body: null,
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
      is_read: false,
      data: { is_actionable: false },
      read_at: null,
      priority: 'medium',
      action_url: null,
      action_label: null,
      entity_type: 'offer',
      entity_id: 'offer-1',
      actor_name: null,
      expires_at: null,
      group_key: null,
    },
    {
      id: 'payment-1',
      user_id: 'user1',
      type: 'payment_created',
      title: 'payment',
      body: null,
      created_at: '2026-01-02T00:00:00.000Z',
      updated_at: '2026-01-02T00:00:00.000Z',
      is_read: false,
      data: { is_actionable: false },
      read_at: null,
      priority: 'medium',
      action_url: null,
      action_label: null,
      entity_type: 'payment',
      entity_id: 'payment-1',
      actor_name: null,
      expires_at: null,
      group_key: null,
    },
  ]

  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ data: mockData }),
  } as Response)

  const { getNotifications } = await import('@/utils/notifications')
  const data = await getNotifications({ unreadOnly: true })

  expect(data.map((item) => item.type)).toEqual(['offer_created', 'payment_created'])
  expect(global.fetch).toHaveBeenCalledWith('/api/notifications?unread_only=true')
})

test('getUnreadNotificationCount returns unread count from API', async () => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ count: 3 }),
  } as Response)

  const { getUnreadNotificationCount } = await import('@/utils/notifications')
  const count = await getUnreadNotificationCount()

  expect(global.fetch).toHaveBeenCalledWith('/api/notifications?unread_count=true')
  expect(count).toBe(3)
})

test('formatUnreadCount formats values', async () => {
  const { formatUnreadCount } = await import('@/utils/notifications')
  expect(formatUnreadCount(0)).toBeNull()
  expect(formatUnreadCount(1)).toBe('1')
  expect(formatUnreadCount(98)).toBe('98')
  expect(formatUnreadCount(120)).toBe('99+')
})

test('markNotificationRead updates read state via API', async () => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
  } as Response)

  const { markNotificationRead } = await import('@/utils/notifications')
  await markNotificationRead('notification-id')

  expect(global.fetch).toHaveBeenCalledWith('/api/notifications/notification-id/read', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ is_read: true }),
  })
})

test('markNotificationUnread updates unread state via API', async () => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
  } as Response)

  const { markNotificationUnread } = await import('@/utils/notifications')
  await markNotificationUnread('notification-id')

  expect(global.fetch).toHaveBeenCalledWith('/api/notifications/notification-id/read', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ is_read: false }),
  })
})

test('markAllNotificationsRead uses API when ids exist', async () => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
  } as Response)

  const { markAllNotificationsRead } = await import('@/utils/notifications')
  await markAllNotificationsRead(['id-1', 'id-2'])

  expect(global.fetch).toHaveBeenCalledWith('/api/notifications/read-all', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids: ['id-1', 'id-2'] }),
  })
})

test('markAllNotificationsRead is no-op when ids are empty', async () => {
  global.fetch = jest.fn()

  const { markAllNotificationsRead } = await import('@/utils/notifications')
  await markAllNotificationsRead([])

  expect(global.fetch).not.toHaveBeenCalled()
})
