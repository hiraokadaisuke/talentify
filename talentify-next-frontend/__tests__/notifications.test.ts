import { createClient } from '@/utils/supabase/client'

jest.mock('@/utils/supabase/client')

test('getNotifications fetches review and offer notifications without extra filters', async () => {
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

  let builder: any
  const mockIn = jest.fn(() => builder)
  builder = {
    select: jest.fn(() => builder),
    eq: jest.fn(() => builder),
    in: mockIn,
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
  expect(mockIn).toHaveBeenCalledWith('type', ['offer_created', 'review_received'])
})
