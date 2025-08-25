jest.mock('@/utils/supabase/client', () => ({
  createClient: jest.fn(),
}))

test('getNotifications fetches notifications for user', async () => {
  const mockData = [
    {
      id: '1',
      user_id: 'user1',
      type: 'offer_created',
      title: 'offer',
      body: 'body',
      created_at: '2024-01-01',
      is_read: false,
      data: null,
    },
    {
      id: '2',
      user_id: 'user1',
      type: 'review_received',
      title: 'review',
      body: 'body',
      created_at: '2023-01-01',
      is_read: true,
      data: { rating: 5 },
    },
  ]

  const { createClient } = require('@/utils/supabase/client')
  let builder: any
  builder = {
    select: jest.fn(() => builder),
    eq: jest.fn(() => builder),
    order: jest.fn(() => builder),
    limit: jest.fn(() => builder),
    then: (resolve: any) => resolve({ data: mockData, error: null }),
  }

  ;(createClient as jest.Mock).mockReturnValue({
    auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'user1' } } }) },
    from: jest.fn(() => builder),
  })

  const { getNotifications } = require('@/utils/notifications')
  const data = await getNotifications()
  expect(data).toHaveLength(2)
  expect(builder.eq).toHaveBeenCalledWith('user_id', 'user1')
})

test('getUnreadNotificationCount returns unread count', async () => {
  jest.resetModules()
  const { createClient } = require('@/utils/supabase/client')
  let builder: any
  builder = {
    select: jest.fn(() => builder),
    eq: jest.fn(() => builder),
    then: (resolve: any) => resolve({ count: 3, data: null, error: null }),
  }

  ;(createClient as jest.Mock).mockReturnValue({
    auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'user1' } } }) },
    from: jest.fn(() => builder),
  })

  const { getUnreadNotificationCount } = require('@/utils/notifications')
  const count = await getUnreadNotificationCount()
  expect(builder.eq).toHaveBeenCalledWith('is_read', false)
  expect(count).toBe(3)
})

test('formatUnreadCount formats values', () => {
  const { formatUnreadCount } = require('@/utils/notifications')
  expect(formatUnreadCount(0)).toBeNull()
  expect(formatUnreadCount(1)).toBe('1')
  expect(formatUnreadCount(98)).toBe('98')
  expect(formatUnreadCount(120)).toBe('99+')
})

