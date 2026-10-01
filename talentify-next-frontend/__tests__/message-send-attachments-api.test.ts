import { NextRequest } from 'next/server'
import { POST } from '@/app/api/messages/send/route'
import { MAX_OFFER_MESSAGE_ATTACHMENTS } from '@/lib/messages/attachments'

jest.mock('@/lib/auth/getCurrentUser', () => ({
  getCurrentUser: jest.fn(),
}))

jest.mock('@/lib/messages/server', () => ({
  authorizeMessageTarget: jest.fn(),
}))

jest.mock('@/lib/supabase/service', () => ({
  createServiceClient: jest.fn(),
}))

jest.mock('@/lib/notifications/emit', () => ({
  emitNotification: jest.fn(),
}))

const { getCurrentUser } = jest.requireMock('@/lib/auth/getCurrentUser') as {
  getCurrentUser: jest.Mock
}
const { authorizeMessageTarget } = jest.requireMock('@/lib/messages/server') as {
  authorizeMessageTarget: jest.Mock
}
const { createServiceClient } = jest.requireMock('@/lib/supabase/service') as {
  createServiceClient: jest.Mock
}
const { emitNotification } = jest.requireMock('@/lib/notifications/emit') as {
  emitNotification: jest.Mock
}

const OFFER_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
const SENDER_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
const RECEIVER_ID = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc'
const OBJECT_ID = '11111111-1111-4111-8111-111111111111'
const PATH = `${OFFER_ID}/${SENDER_ID}/${OBJECT_ID}.pdf`

function request(body: unknown) {
  return new NextRequest('http://localhost/api/messages/send', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

function attachment(overrides: Record<string, unknown> = {}) {
  return {
    path: PATH,
    name: '案件資料.pdf',
    type: 'application/pdf',
    size: 2048,
    ...overrides,
  }
}

describe('POST /api/messages/send attachments', () => {
  const list = jest.fn()
  const storageFrom = jest.fn(() => ({ list }))
  const single = jest.fn()
  const select = jest.fn(() => ({ single }))
  const insert = jest.fn(() => ({ select }))
  const tableFrom = jest.fn(() => ({ insert }))

  beforeEach(() => {
    jest.clearAllMocks()

    getCurrentUser.mockResolvedValue({
      user: { id: SENDER_ID },
      error: null,
    })

    authorizeMessageTarget.mockResolvedValue({
      ok: true,
      sender: { userId: SENDER_ID, role: 'store', name: '店舗' },
      receiver: { userId: RECEIVER_ID, role: 'talent', name: '演者' },
    })

    list.mockResolvedValue({
      data: [
        {
          id: 'storage-object-id',
          name: `${OBJECT_ID}.pdf`,
          metadata: {
            size: 2048,
            mimetype: 'application/pdf',
          },
        },
      ],
      error: null,
    })

    single.mockResolvedValue({
      data: {
        id: 'message-id',
        offer_id: OFFER_ID,
        sender_user: SENDER_ID,
        receiver_user: RECEIVER_ID,
        sender_role: 'store',
        body: null,
        attachments: [attachment()],
        created_at: new Date().toISOString(),
      },
      error: null,
    })

    createServiceClient.mockReturnValue({
      storage: { from: storageFrom },
      from: tableFrom,
    })

    emitNotification.mockResolvedValue(undefined)
  })

  it('keeps existing text-only messages working without Storage checks', async () => {
    const res = await POST(
      request({
        receiverUserId: RECEIVER_ID,
        offerId: OFFER_ID,
        body: '確認お願いします',
      }),
    )

    expect(res.status).toBe(201)
    expect(storageFrom).not.toHaveBeenCalled()
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        body: '確認お願いします',
        attachments: [],
      }),
    )
  })

  it('allows an attachment-only message after verifying the stored object', async () => {
    const res = await POST(
      request({
        receiverUserId: RECEIVER_ID,
        offerId: OFFER_ID,
        body: '',
        attachments: [attachment()],
      }),
    )

    expect(res.status).toBe(201)
    expect(storageFrom).toHaveBeenCalledWith('offer-attachments')
    expect(list).toHaveBeenCalledWith(
      `${OFFER_ID}/${SENDER_ID}`,
      expect.objectContaining({
        search: `${OBJECT_ID}.pdf`,
      }),
    )
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        body: null,
        attachments: [attachment()],
      }),
    )
  })

  it('rejects attachment paths owned by another user before Storage access', async () => {
    const otherUserId = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'
    const res = await POST(
      request({
        receiverUserId: RECEIVER_ID,
        offerId: OFFER_ID,
        attachments: [
          attachment({
            path: `${OFFER_ID}/${otherUserId}/${OBJECT_ID}.pdf`,
          }),
        ],
      }),
    )

    expect(res.status).toBe(400)
    await expect(res.json()).resolves.toEqual({
      error: 'invalid_attachment_path',
    })
    expect(authorizeMessageTarget).not.toHaveBeenCalled()
    expect(createServiceClient).not.toHaveBeenCalled()
  })

  it('rejects more than the allowed number of attachments', async () => {
    const res = await POST(
      request({
        receiverUserId: RECEIVER_ID,
        offerId: OFFER_ID,
        attachments: Array.from(
          { length: MAX_OFFER_MESSAGE_ATTACHMENTS + 1 },
          (_, index) =>
            attachment({
              path: `${OFFER_ID}/${SENDER_ID}/11111111-1111-4111-8111-11111111111${index}.pdf`,
            }),
        ),
      }),
    )

    expect(res.status).toBe(400)
    await expect(res.json()).resolves.toEqual({
      error: 'too_many_attachments',
    })
    expect(authorizeMessageTarget).not.toHaveBeenCalled()
  })

  it('rejects missing Storage objects after participant authorization', async () => {
    list.mockResolvedValue({ data: [], error: null })

    const res = await POST(
      request({
        receiverUserId: RECEIVER_ID,
        offerId: OFFER_ID,
        attachments: [attachment()],
      }),
    )

    expect(res.status).toBe(400)
    await expect(res.json()).resolves.toEqual({
      error: 'attachment_not_found',
    })
    expect(authorizeMessageTarget).toHaveBeenCalled()
    expect(insert).not.toHaveBeenCalled()
  })

  it('rejects claimed metadata that does not match the stored object', async () => {
    list.mockResolvedValue({
      data: [
        {
          id: 'storage-object-id',
          name: `${OBJECT_ID}.pdf`,
          metadata: {
            size: 4096,
            mimetype: 'application/pdf',
          },
        },
      ],
      error: null,
    })

    const res = await POST(
      request({
        receiverUserId: RECEIVER_ID,
        offerId: OFFER_ID,
        attachments: [attachment()],
      }),
    )

    expect(res.status).toBe(400)
    await expect(res.json()).resolves.toEqual({
      error: 'attachment_metadata_mismatch',
    })
    expect(insert).not.toHaveBeenCalled()
  })

  it('rejects invalid receiver and offer ids before authorization', async () => {
    const invalidReceiver = await POST(
      request({
        receiverUserId: 'not-a-uuid',
        offerId: OFFER_ID,
        body: '確認お願いします',
      }),
    )

    expect(invalidReceiver.status).toBe(400)
    await expect(invalidReceiver.json()).resolves.toEqual({
      error: 'invalid_target',
    })

    const invalidOffer = await POST(
      request({
        receiverUserId: RECEIVER_ID,
        offerId: 'not-a-uuid',
        body: '確認お願いします',
      }),
    )

    expect(invalidOffer.status).toBe(400)
    await expect(invalidOffer.json()).resolves.toEqual({
      error: 'invalid_target',
    })
    expect(authorizeMessageTarget).not.toHaveBeenCalled()
    expect(createServiceClient).not.toHaveBeenCalled()
  })

  it('does not allow attachments without an offer context', async () => {
    const res = await POST(
      request({
        receiverUserId: RECEIVER_ID,
        attachments: [attachment()],
      }),
    )

    expect(res.status).toBe(400)
    await expect(res.json()).resolves.toEqual({
      error: 'attachments_require_offer',
    })
    expect(authorizeMessageTarget).not.toHaveBeenCalled()
  })
})
