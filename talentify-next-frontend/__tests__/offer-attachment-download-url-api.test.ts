import { NextRequest } from 'next/server'
import { POST } from '@/app/api/messages/attachments/download-url/route'
import {
  OFFER_ATTACHMENT_BUCKET,
  OFFER_ATTACHMENT_SIGNED_DOWNLOAD_EXPIRES_IN,
} from '@/lib/messages/attachments'

jest.mock('@/lib/auth/getCurrentUser', () => ({
  getCurrentUser: jest.fn(),
}))

jest.mock('@/lib/supabase/service', () => ({
  createServiceClient: jest.fn(),
}))

const { getCurrentUser } = jest.requireMock('@/lib/auth/getCurrentUser') as {
  getCurrentUser: jest.Mock
}
const { createServiceClient } = jest.requireMock('@/lib/supabase/service') as {
  createServiceClient: jest.Mock
}

const MESSAGE_ID = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'
const OFFER_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
const SENDER_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
const RECEIVER_ID = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc'
const OBJECT_ID = '11111111-1111-4111-8111-111111111111'
const PATH = `${OFFER_ID}/${SENDER_ID}/${OBJECT_ID}.pdf`

function request(body: unknown) {
  return new NextRequest(
    'http://localhost/api/messages/attachments/download-url',
    {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    },
  )
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

describe('POST /api/messages/attachments/download-url', () => {
  const maybeSingle = jest.fn()
  const eq = jest.fn(() => ({ maybeSingle }))
  const select = jest.fn(() => ({ eq }))
  const tableFrom = jest.fn(() => ({ select }))

  const createSignedUrl = jest.fn()
  const storageFrom = jest.fn(() => ({ createSignedUrl }))

  beforeEach(() => {
    jest.clearAllMocks()

    getCurrentUser.mockResolvedValue({
      user: { id: RECEIVER_ID },
      error: null,
    })

    maybeSingle.mockResolvedValue({
      data: {
        id: MESSAGE_ID,
        offer_id: OFFER_ID,
        sender_user: SENDER_ID,
        receiver_user: RECEIVER_ID,
        attachments: [attachment()],
      },
      error: null,
    })

    createSignedUrl.mockResolvedValue({
      data: {
        signedUrl: 'https://example.test/signed-download',
      },
      error: null,
    })

    createServiceClient.mockReturnValue({
      from: tableFrom,
      storage: { from: storageFrom },
    })
  })

  it('rejects unauthenticated users before reading message data', async () => {
    getCurrentUser.mockResolvedValue({
      user: null,
      error: new Error('no session'),
    })

    const res = await POST(
      request({
        messageId: MESSAGE_ID,
        path: PATH,
      }),
    )

    expect(res.status).toBe(401)
    expect(createServiceClient).not.toHaveBeenCalled()
  })

  it('does not issue a URL to a user outside the message participants', async () => {
    getCurrentUser.mockResolvedValue({
      user: { id: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee' },
      error: null,
    })

    const res = await POST(
      request({
        messageId: MESSAGE_ID,
        path: PATH,
      }),
    )

    expect(res.status).toBe(403)
    expect(storageFrom).not.toHaveBeenCalled()
  })

  it('rejects a path that is not referenced by the message', async () => {
    const res = await POST(
      request({
        messageId: MESSAGE_ID,
        path: `${OFFER_ID}/${SENDER_ID}/22222222-2222-4222-8222-222222222222.pdf`,
      }),
    )

    expect(res.status).toBe(404)
    await expect(res.json()).resolves.toEqual({
      error: 'attachment_not_found',
    })
    expect(storageFrom).not.toHaveBeenCalled()
  })

  it('rejects malformed attachment metadata stored on the message', async () => {
    maybeSingle.mockResolvedValue({
      data: {
        id: MESSAGE_ID,
        offer_id: OFFER_ID,
        sender_user: SENDER_ID,
        receiver_user: RECEIVER_ID,
        attachments: [
          attachment({
            path: `${OFFER_ID}/eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee/${OBJECT_ID}.pdf`,
          }),
        ],
      },
      error: null,
    })

    const forgedPath =
      `${OFFER_ID}/eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee/${OBJECT_ID}.pdf`

    const res = await POST(
      request({
        messageId: MESSAGE_ID,
        path: forgedPath,
      }),
    )

    expect(res.status).toBe(404)
    expect(storageFrom).not.toHaveBeenCalled()
  })

  it('issues a five-minute preview URL for a referenced attachment', async () => {
    const res = await POST(
      request({
        messageId: MESSAGE_ID,
        path: PATH,
      }),
    )

    expect(res.status).toBe(200)
    expect(tableFrom).toHaveBeenCalledWith('offer_messages')
    expect(select).toHaveBeenCalledWith(
      'id,offer_id,sender_user,receiver_user,attachments',
    )
    expect(eq).toHaveBeenCalledWith('id', MESSAGE_ID)
    expect(storageFrom).toHaveBeenCalledWith(OFFER_ATTACHMENT_BUCKET)
    expect(createSignedUrl).toHaveBeenCalledWith(
      PATH,
      OFFER_ATTACHMENT_SIGNED_DOWNLOAD_EXPIRES_IN,
      undefined,
    )
    await expect(res.json()).resolves.toMatchObject({
      data: {
        url: 'https://example.test/signed-download',
        expiresIn: OFFER_ATTACHMENT_SIGNED_DOWNLOAD_EXPIRES_IN,
        attachment: attachment(),
      },
    })
  })

  it('can issue a signed URL that triggers a download', async () => {
    const res = await POST(
      request({
        messageId: MESSAGE_ID,
        path: PATH,
        download: true,
      }),
    )

    expect(res.status).toBe(200)
    expect(createSignedUrl).toHaveBeenCalledWith(
      PATH,
      OFFER_ATTACHMENT_SIGNED_DOWNLOAD_EXPIRES_IN,
      { download: true },
    )
  })
})
