import {
  getOfferAttachmentDownloadUrl,
  OfferAttachmentDownloadUrlError,
} from '@/lib/messages/get-offer-attachment-download-url'

const MESSAGE_ID = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'
const PATH =
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb/11111111-1111-4111-8111-111111111111.pdf'

function makeResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: jest.fn().mockResolvedValue(body),
  } as unknown as Response
}

function successPayload(url = 'https://project.supabase.co/storage/v1/object/sign/offer-attachments/file?token=abc') {
  return {
    data: {
      url,
      expiresIn: 300,
      attachment: {
        path: PATH,
        name: '案件資料.pdf',
        type: 'application/pdf',
        size: 2048,
      },
    },
  }
}

describe('getOfferAttachmentDownloadUrl', () => {
  const fetchMock = jest.fn()
  const originalSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

  beforeEach(() => {
    jest.clearAllMocks()
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://project.supabase.co'

    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      writable: true,
      value: fetchMock,
    })

    fetchMock.mockResolvedValue(makeResponse(successPayload()))
  })

  afterAll(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = originalSupabaseUrl
  })

  it('requests a preview signed url for the exact message attachment', async () => {
    const result = await getOfferAttachmentDownloadUrl({
      messageId: MESSAGE_ID,
      path: PATH,
    })

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/messages/attachments/download-url',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageId: MESSAGE_ID,
          path: PATH,
          download: false,
        }),
      }),
    )
    expect(result).toEqual({
      url: successPayload().data.url,
      expiresIn: 300,
    })
  })

  it('requests download behavior when explicitly requested', async () => {
    await getOfferAttachmentDownloadUrl({
      messageId: MESSAGE_ID,
      path: PATH,
      download: true,
    })

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/messages/attachments/download-url',
      expect.objectContaining({
        body: JSON.stringify({
          messageId: MESSAGE_ID,
          path: PATH,
          download: true,
        }),
      }),
    )
  })

  it('preserves authorization failures for caller-side handling', async () => {
    fetchMock.mockResolvedValue(
      makeResponse({ error: 'forbidden' }, 403),
    )

    const promise = getOfferAttachmentDownloadUrl({
      messageId: MESSAGE_ID,
      path: PATH,
    })

    await expect(promise).rejects.toMatchObject({
      name: 'OfferAttachmentDownloadUrlError',
      code: 'forbidden',
      status: 403,
    })
  })

  it('rejects a signed url from an unexpected origin', async () => {
    fetchMock.mockResolvedValue(
      makeResponse(successPayload('https://evil.example/file')),
    )

    const promise = getOfferAttachmentDownloadUrl({
      messageId: MESSAGE_ID,
      path: PATH,
    })

    await expect(promise).rejects.toMatchObject({
      name: 'OfferAttachmentDownloadUrlError',
      code: 'invalid_attachment_download_url_response',
    })
  })

  it('rejects responses for a different attachment path', async () => {
    const payload = successPayload()
    payload.data.attachment.path = 'different/path.pdf'
    fetchMock.mockResolvedValue(makeResponse(payload))

    const promise = getOfferAttachmentDownloadUrl({
      messageId: MESSAGE_ID,
      path: PATH,
    })

    await expect(promise).rejects.toMatchObject({
      name: 'OfferAttachmentDownloadUrlError',
      code: 'invalid_attachment_download_url_response',
    })
  })

  it('returns a stable request error when the API cannot be reached', async () => {
    fetchMock.mockRejectedValue(new Error('network down'))

    const promise = getOfferAttachmentDownloadUrl({
      messageId: MESSAGE_ID,
      path: PATH,
    })

    await expect(promise).rejects.toMatchObject({
      name: 'OfferAttachmentDownloadUrlError',
      code: 'attachment_download_url_request_failed',
    })
  })

  it('uses a stable error class', () => {
    const error = new OfferAttachmentDownloadUrlError('forbidden', 403)

    expect(error).toBeInstanceOf(Error)
    expect(error.code).toBe('forbidden')
    expect(error.status).toBe(403)
  })
})
