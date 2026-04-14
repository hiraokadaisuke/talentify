import { NextRequest } from 'next/server'
import { GET as getNotificationsRoute } from '@/app/api/notifications/route'
import { PATCH as patchNotificationReadRoute } from '@/app/api/notifications/[id]/read/route'
import { PATCH as patchNotificationsReadAllRoute } from '@/app/api/notifications/read-all/route'
import { getNotificationLink, isActionRequired } from '@/components/notifications/notification-meta'
import type { NotificationRow } from '@/utils/notifications'

jest.mock('@/lib/auth/getCurrentUser', () => ({
  getCurrentUser: jest.fn(),
}))

jest.mock('@/lib/repositories/notifications', () => ({
  countUnreadNotificationsByUser: jest.fn(),
  findNotificationsByUser: jest.fn(),
  markNotificationRead: jest.fn(),
  markNotificationUnread: jest.fn(),
  markAllNotificationsRead: jest.fn(),
  findNotificationOwner: jest.fn(),
}))

jest.mock('@/lib/notification-idempotency', () => ({
  getIdempotentResponse: jest.fn().mockResolvedValue(null),
  persistIdempotentResponse: jest.fn().mockResolvedValue(undefined),
}))

const { getCurrentUser } = jest.requireMock('@/lib/auth/getCurrentUser') as {
  getCurrentUser: jest.Mock
}

const {
  countUnreadNotificationsByUser,
  findNotificationsByUser,
  markNotificationRead,
  markNotificationUnread,
  markAllNotificationsRead,
  findNotificationOwner,
} = jest.requireMock('@/lib/repositories/notifications') as {
  countUnreadNotificationsByUser: jest.Mock
  findNotificationsByUser: jest.Mock
  markNotificationRead: jest.Mock
  markNotificationUnread: jest.Mock
  markAllNotificationsRead: jest.Mock
  findNotificationOwner: jest.Mock
}

function buildNotification(overrides: Partial<NotificationRow>): NotificationRow {
  return {
    id: 'n1',
    user_id: 'u1',
    type: 'message',
    title: 'title',
    body: 'body',
    is_read: false,
    data: { recipient_role: 'talent' },
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
    read_at: null,
    priority: 'medium',
    action_url: null,
    action_label: null,
    entity_type: null,
    entity_id: null,
    actor_name: 'Actor',
    expires_at: null,
    group_key: null,
    ...overrides,
  }
}

describe('notifications quality e2e', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    getCurrentUser.mockResolvedValue({ user: { id: 'u1' } })
  })

  it('A. unread count on header and list stays aligned', async () => {
    countUnreadNotificationsByUser.mockResolvedValue(3)
    findNotificationsByUser.mockResolvedValue([
      buildNotification({ id: 'n1' }),
      buildNotification({ id: 'n2' }),
      buildNotification({ id: 'n3' }),
    ])

    const countReq = new NextRequest('http://localhost/api/notifications?unread_count=true')
    const countRes = await getNotificationsRoute(countReq)
    await expect(countRes.json()).resolves.toMatchObject({ count: 3 })

    const listReq = new NextRequest('http://localhost/api/notifications?unread_only=true')
    const listRes = await getNotificationsRoute(listReq)
    const listBody = await listRes.json()

    expect(Array.isArray(listBody.data)).toBe(true)
    expect(listBody.data).toHaveLength(3)
  })

  it('B/F. mark-as-read is idempotent under duplicate requests', async () => {
    markNotificationRead
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(0)
    findNotificationOwner.mockResolvedValue(true)

    const firstReq = new NextRequest('http://localhost/api/notifications/n1/read', {
      method: 'PATCH',
      body: JSON.stringify({ is_read: true }),
    })
    const secondReq = new NextRequest('http://localhost/api/notifications/n1/read', {
      method: 'PATCH',
      body: JSON.stringify({ is_read: true }),
    })

    const first = await patchNotificationReadRoute(firstReq, { params: Promise.resolve({ id: 'n1' }) })
    await expect(first.json()).resolves.toMatchObject({ ok: true, updated: 1, noop: false })

    const second = await patchNotificationReadRoute(secondReq, { params: Promise.resolve({ id: 'n1' }) })
    await expect(second.json()).resolves.toMatchObject({ ok: true, updated: 0, noop: true })
  })

  it('C/F. mark-all-read remains safe when unread is already zero', async () => {
    markAllNotificationsRead
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(0)

    const req = new NextRequest('http://localhost/api/notifications/read-all', {
      method: 'PATCH',
      body: JSON.stringify({ ids: ['n1', 'n2'] }),
    })

    const first = await patchNotificationsReadAllRoute(req)
    await expect(first.json()).resolves.toMatchObject({ ok: true, updated: 2 })

    const second = await patchNotificationsReadAllRoute(req)
    await expect(second.json()).resolves.toMatchObject({ ok: true, updated: 0 })
  })

  it('D. tab query options map consistently to repository filters', async () => {
    findNotificationsByUser.mockResolvedValue([])

    await getNotificationsRoute(new NextRequest('http://localhost/api/notifications'))
    expect(findNotificationsByUser).toHaveBeenLastCalledWith(
      expect.objectContaining({ unreadOnly: false, actionableOnly: false, category: undefined }),
    )

    await getNotificationsRoute(new NextRequest('http://localhost/api/notifications?unread_only=true'))
    expect(findNotificationsByUser).toHaveBeenLastCalledWith(
      expect.objectContaining({ unreadOnly: true, actionableOnly: false }),
    )

    await getNotificationsRoute(new NextRequest('http://localhost/api/notifications?actionable_only=true'))
    expect(findNotificationsByUser).toHaveBeenLastCalledWith(
      expect.objectContaining({ unreadOnly: false, actionableOnly: true, category: undefined }),
    )

    await getNotificationsRoute(new NextRequest('http://localhost/api/notifications?category=announcement'))
    expect(findNotificationsByUser).toHaveBeenLastCalledWith(
      expect.objectContaining({ category: 'announcement' }),
    )
  })

  it('E. notification click links resolve to message/invoice/review/offer destinations', () => {
    const message = buildNotification({ type: 'message', data: { recipient_role: 'store' } })
    const invoice = buildNotification({
      type: 'invoice_submitted',
      data: { recipient_role: 'store', invoice_id: 'inv-1' },
    })
    const review = buildNotification({
      type: 'review_received',
      data: { recipient_role: 'talent' },
      action_url: '/talent/reviews',
    })
    const offer = buildNotification({
      type: 'offer_created',
      data: { recipient_role: 'talent', offer_id: 'offer-1', status: 'pending' },
    })

    expect(getNotificationLink(message)).toBe('/store/messages')
    expect(getNotificationLink(invoice)).toBe('/store/invoices/inv-1')
    expect(getNotificationLink(review)).toBe('/talent/reviews')
    expect(getNotificationLink(offer)).toBe('/talent/offers/offer-1')
    expect(isActionRequired(offer)).toBe(true)
  })

  it('F. client mutation locks prevent duplicate network calls during rapid clicks', async () => {
    jest.resetModules()

    const deferred = (() => {
      let resolve: ((value: Response) => void) | null = null
      const promise = new Promise<Response>((r) => {
        resolve = r
      })
      return { promise, resolve }
    })()

    global.fetch = jest.fn().mockReturnValue(deferred.promise)

    const { markNotificationRead, markAllNotificationsRead } = await import('@/utils/notifications')

    const p1 = markNotificationRead('n-rapid')
    const p2 = markNotificationRead('n-rapid')

    expect(global.fetch).toHaveBeenCalledTimes(1)

    deferred.resolve?.({ ok: true } as Response)
    await Promise.all([p1, p2])

    ;(global.fetch as jest.Mock).mockResolvedValue({ ok: true } as Response)
    await Promise.all([
      markAllNotificationsRead(['a', 'b']),
      markAllNotificationsRead(['a', 'b']),
      markAllNotificationsRead(['a', 'b']),
    ])

    expect(global.fetch).toHaveBeenCalledTimes(2)
  })

  it('G. second page can reconcile from DB source of truth after external mutation', async () => {
    markNotificationUnread.mockResolvedValue(1)
    markNotificationRead.mockResolvedValue(1)

    const unreadReq = new NextRequest('http://localhost/api/notifications/n1/read', {
      method: 'PATCH',
      body: JSON.stringify({ is_read: false }),
    })
    const readReq = new NextRequest('http://localhost/api/notifications/n1/read', {
      method: 'PATCH',
      body: JSON.stringify({ is_read: true }),
    })

    await patchNotificationReadRoute(unreadReq, { params: Promise.resolve({ id: 'n1' }) })
    const refreshed = await patchNotificationReadRoute(readReq, { params: Promise.resolve({ id: 'n1' }) })

    await expect(refreshed.json()).resolves.toMatchObject({ ok: true, updated: 1 })
  })
})
