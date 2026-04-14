import { NextRequest } from 'next/server'
import { PATCH as patchNotificationReadRoute } from '@/app/api/notifications/[id]/read/route'
import { PATCH as patchNotificationsReadAllRoute } from '@/app/api/notifications/read-all/route'
import {
  findNotificationOwner,
  markAllNotificationsRead,
  markNotificationRead,
  markNotificationUnread,
} from '@/lib/repositories/notifications'

jest.mock('@/lib/auth/getCurrentUser', () => ({
  getCurrentUser: jest.fn(),
}))

jest.mock('@/lib/repositories/notifications', () => ({
  findNotificationOwner: jest.fn(),
  markNotificationRead: jest.fn(),
  markNotificationUnread: jest.fn(),
  markAllNotificationsRead: jest.fn(),
}))

jest.mock('@/lib/notification-idempotency', () => ({
  getIdempotentResponse: jest.fn().mockResolvedValue(null),
  persistIdempotentResponse: jest.fn().mockResolvedValue(undefined),
}))

const { getCurrentUser } = jest.requireMock('@/lib/auth/getCurrentUser') as {
  getCurrentUser: jest.Mock
}

const mockedFindNotificationOwner = findNotificationOwner as jest.MockedFunction<typeof findNotificationOwner>
const mockedMarkNotificationRead = markNotificationRead as jest.MockedFunction<typeof markNotificationRead>
const mockedMarkNotificationUnread = markNotificationUnread as jest.MockedFunction<typeof markNotificationUnread>
const mockedMarkAllNotificationsRead = markAllNotificationsRead as jest.MockedFunction<typeof markAllNotificationsRead>

describe('notification mutation api idempotency', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    getCurrentUser.mockResolvedValue({ user: { id: 'u1' } })
  })

  it('returns noop for already-read item instead of 404', async () => {
    mockedMarkNotificationRead.mockResolvedValue(0)
    mockedFindNotificationOwner.mockResolvedValue(true)

    const req = new NextRequest('http://localhost/api/notifications/n1/read', {
      method: 'PATCH',
      body: JSON.stringify({ is_read: true }),
    })

    const res = await patchNotificationReadRoute(req, { params: Promise.resolve({ id: 'n1' }) })

    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toMatchObject({ ok: true, noop: true, updated: 0 })
  })

  it('keeps 404 for truly missing notification', async () => {
    mockedMarkNotificationUnread.mockResolvedValue(0)
    mockedFindNotificationOwner.mockResolvedValue(false)

    const req = new NextRequest('http://localhost/api/notifications/missing/read', {
      method: 'PATCH',
      body: JSON.stringify({ is_read: false }),
    })

    const res = await patchNotificationReadRoute(req, { params: Promise.resolve({ id: 'missing' }) })

    expect(res.status).toBe(404)
  })

  it('allows mark-all on empty unread set', async () => {
    mockedMarkAllNotificationsRead.mockResolvedValue(0)

    const req = new NextRequest('http://localhost/api/notifications/read-all', {
      method: 'PATCH',
      body: JSON.stringify({ ids: ['n1'] }),
    })

    const res = await patchNotificationsReadAllRoute(req)

    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toMatchObject({ ok: true, updated: 0 })
  })
})
