import { NextRequest } from 'next/server'
import { POST } from '@/app/api/messages/attachments/upload-url/route'
import {
  MAX_OFFER_ATTACHMENT_SIZE,
  OFFER_ATTACHMENT_BUCKET,
} from '@/lib/messages/attachments'

jest.mock('crypto', () => ({
  randomUUID: jest.fn(() => '11111111-1111-4111-8111-111111111111'),
}))

jest.mock('@/lib/auth/getCurrentUser', () => ({
  getCurrentUser: jest.fn(),
}))

jest.mock('@/lib/messages/server', () => ({
  authorizeMessageTarget: jest.fn(),
}))

jest.mock('@/lib/supabase/service', () => ({
  createServiceClient: jest.fn(),
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

const OFFER_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
const SENDER_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
const RECEIVER_ID = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc'

function request(body: unknown) {
  return new NextRequest('http://localhost/api/messages/attachments/upload-url', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('POST /api/messages/attachments/upload-url', () => {
  const createSignedUploadUrl = jest.fn()
  const from = jest.fn(() => ({ createSignedUploadUrl }))

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
    createServiceClient.mockReturnValue({
      storage: { from },
    })
    createSignedUploadUrl.mockResolvedValue({
      data: {
        path: `${OFFER_ID}/${SENDER_ID}/11111111-1111-4111-8111-111111111111.pdf`,
        token: 'signed-upload-token',
        signedUrl: 'https://example.test/signed-upload',
      },
      error: null,
    })
  })

  it('rejects unauthenticated users', async () => {
    getCurrentUser.mockResolvedValue({ user: null, error: new Error('no session') })

    const res = await POST(
      request({
        offerId: OFFER_ID,
        receiverUserId: RECEIVER_ID,
        fileName: 'brief.pdf',
        contentType: 'application/pdf',
        size: 1024,
      }),
    )

    expect(res.status).toBe(401)
    expect(authorizeMessageTarget).not.toHaveBeenCalled()
  })

  it('rejects unsupported file types before authorization', async () => {
    const res = await POST(
      request({
        offerId: OFFER_ID,
        receiverUserId: RECEIVER_ID,
        fileName: 'archive.zip',
        contentType: 'application/zip',
        size: 1024,
      }),
    )

    expect(res.status).toBe(400)
    await expect(res.json()).resolves.toEqual({ error: 'unsupported_file_type' })
    expect(authorizeMessageTarget).not.toHaveBeenCalled()
  })

  it('rejects files over 10MB before authorization', async () => {
    const res = await POST(
      request({
        offerId: OFFER_ID,
        receiverUserId: RECEIVER_ID,
        fileName: 'large.pdf',
        contentType: 'application/pdf',
        size: MAX_OFFER_ATTACHMENT_SIZE + 1,
      }),
    )

    expect(res.status).toBe(400)
    await expect(res.json()).resolves.toEqual({ error: 'invalid_file_size' })
    expect(authorizeMessageTarget).not.toHaveBeenCalled()
  })

  it('does not issue upload credentials to non-participants', async () => {
    authorizeMessageTarget.mockResolvedValue({
      ok: false,
      reason: 'not_offer_participant',
    })

    const res = await POST(
      request({
        offerId: OFFER_ID,
        receiverUserId: RECEIVER_ID,
        fileName: 'brief.pdf',
        contentType: 'application/pdf',
        size: 1024,
      }),
    )

    expect(res.status).toBe(403)
    expect(createServiceClient).not.toHaveBeenCalled()
  })

  it('issues a non-upsert signed upload token with a server-generated path', async () => {
    const res = await POST(
      request({
        offerId: OFFER_ID,
        receiverUserId: RECEIVER_ID,
        fileName: '案件資料.pdf',
        contentType: 'application/pdf',
        size: 2048,
      }),
    )

    expect(res.status).toBe(201)
    expect(authorizeMessageTarget).toHaveBeenCalledWith({
      senderUserId: SENDER_ID,
      receiverUserId: RECEIVER_ID,
      offerId: OFFER_ID,
    })
    expect(from).toHaveBeenCalledWith(OFFER_ATTACHMENT_BUCKET)
    expect(createSignedUploadUrl).toHaveBeenCalledWith(
      `${OFFER_ID}/${SENDER_ID}/11111111-1111-4111-8111-111111111111.pdf`,
      { upsert: false },
    )
    await expect(res.json()).resolves.toMatchObject({
      data: {
        bucket: OFFER_ATTACHMENT_BUCKET,
        path: `${OFFER_ID}/${SENDER_ID}/11111111-1111-4111-8111-111111111111.pdf`,
        token: 'signed-upload-token',
        attachment: {
          name: '案件資料.pdf',
          type: 'application/pdf',
          size: 2048,
        },
      },
    })
  })
})
