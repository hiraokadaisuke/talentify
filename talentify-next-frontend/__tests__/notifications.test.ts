import type { NotificationRow } from '@/utils/notifications'

jest.mock('@/utils/supabase/client', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      update: jest.fn(() => ({
        eq: jest.fn(),
        in: jest.fn(),
      })),
    })),
  })),
}))

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
