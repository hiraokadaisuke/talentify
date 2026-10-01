import {
  OfferAttachmentUploadError,
  uploadOfferAttachment,
} from '@/lib/messages/upload-offer-attachment'
import { OFFER_ATTACHMENT_BUCKET } from '@/lib/messages/attachments'

jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(),
}))

const { createClient } = jest.requireMock('@/lib/supabase/client') as {
  createClient: jest.Mock
}

const OFFER_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
const RECEIVER_ID = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc'
const STORAGE_PATH =
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb/11111111-1111-4111-8111-111111111111.pdf'

function makeFile(overrides: Partial<File> = {}) {
  return {
    name: '案件資料.pdf',
    type: 'application/pdf',
    size: 2048,
    ...overrides,
  } as File
}

function makeResponse(body: unknown, status = 201) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: jest.fn().mockResolvedValue(body),
  } as unknown as Response
}

function signedUploadResponse() {
  return {
    data: {
      bucket: OFFER_ATTACHMENT_BUCKET,
      path: STORAGE_PATH,
      token: 'signed-upload-token',
      expiresIn: 7200,
      attachment: {
        path: STORAGE_PATH,
        name: '案件資料.pdf',
        type: 'application/pdf',
        size: 2048,
      },
    },
  }
}

describe('uploadOfferAttachment', () => {
  const fetchMock = jest.fn()
  const uploadToSignedUrl = jest.fn()
  const from = jest.fn(() => ({ uploadToSignedUrl }))

  beforeEach(() => {
    jest.clearAllMocks()

    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      writable: true,
      value: fetchMock,
    })

    createClient.mockReturnValue({
      storage: { from },
    })

    fetchMock.mockResolvedValue(makeResponse(signedUploadResponse()))
    uploadToSignedUrl.mockResolvedValue({
      data: {
        path: STORAGE_PATH,
        fullPath: `${OFFER_ATTACHMENT_BUCKET}/${STORAGE_PATH}`,
      },
      error: null,
    })
  })

  it('requests credentials and uploads the same file to the signed path', async () => {
    const file = makeFile()

    const result = await uploadOfferAttachment({
      offerId: OFFER_ID,
      receiverUserId: RECEIVER_ID,
      file,
    })

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/messages/attachments/upload-url',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offerId: OFFER_ID,
          receiverUserId: RECEIVER_ID,
          fileName: '案件資料.pdf',
          contentType: 'application/pdf',
          size: 2048,
        }),
      }),
    )
    expect(from).toHaveBeenCalledWith(OFFER_ATTACHMENT_BUCKET)
    expect(uploadToSignedUrl).toHaveBeenCalledWith(
      STORAGE_PATH,
      'signed-upload-token',
      file,
    )
    expect(result).toEqual({
      bucket: OFFER_ATTACHMENT_BUCKET,
      path: STORAGE_PATH,
      name: '案件資料.pdf',
      type: 'application/pdf',
      size: 2048,
    })
  })

  it('rejects unsupported files before requesting upload credentials', async () => {
    const promise = uploadOfferAttachment({
      offerId: OFFER_ID,
      receiverUserId: RECEIVER_ID,
      file: makeFile({
        name: 'archive.zip',
        type: 'application/zip',
      }),
    })

    await expect(promise).rejects.toMatchObject({
      name: 'OfferAttachmentUploadError',
      code: 'unsupported_file_type',
      stage: 'validate',
    })
    expect(fetchMock).not.toHaveBeenCalled()
    expect(createClient).not.toHaveBeenCalled()
  })

  it('preserves server authorization errors and status codes', async () => {
    fetchMock.mockResolvedValue(
      makeResponse({ error: 'not_offer_participant' }, 403),
    )

    const promise = uploadOfferAttachment({
      offerId: OFFER_ID,
      receiverUserId: RECEIVER_ID,
      file: makeFile(),
    })

    await expect(promise).rejects.toMatchObject({
      name: 'OfferAttachmentUploadError',
      code: 'not_offer_participant',
      stage: 'prepare',
      status: 403,
    })
    expect(createClient).not.toHaveBeenCalled()
  })

  it('rejects malformed successful credential responses', async () => {
    fetchMock.mockResolvedValue(
      makeResponse({
        data: {
          ...signedUploadResponse().data,
          bucket: 'unexpected-bucket',
        },
      }),
    )

    const promise = uploadOfferAttachment({
      offerId: OFFER_ID,
      receiverUserId: RECEIVER_ID,
      file: makeFile(),
    })

    await expect(promise).rejects.toMatchObject({
      name: 'OfferAttachmentUploadError',
      code: 'invalid_signed_upload_response',
      stage: 'prepare',
    })
    expect(createClient).not.toHaveBeenCalled()
  })

  it('rejects signed responses whose metadata differs from the selected file', async () => {
    const response = signedUploadResponse()
    response.data.attachment.size = 1024
    fetchMock.mockResolvedValue(makeResponse(response))

    const promise = uploadOfferAttachment({
      offerId: OFFER_ID,
      receiverUserId: RECEIVER_ID,
      file: makeFile(),
    })

    await expect(promise).rejects.toMatchObject({
      name: 'OfferAttachmentUploadError',
      code: 'invalid_signed_upload_response',
      stage: 'prepare',
    })
    expect(createClient).not.toHaveBeenCalled()
  })

  it('returns a stable upload error when Storage rejects the signed upload', async () => {
    uploadToSignedUrl.mockResolvedValue({
      data: null,
      error: new Error('storage failed'),
    })

    const promise = uploadOfferAttachment({
      offerId: OFFER_ID,
      receiverUserId: RECEIVER_ID,
      file: makeFile(),
    })

    await expect(promise).rejects.toMatchObject({
      name: 'OfferAttachmentUploadError',
      code: 'storage_upload_failed',
      stage: 'upload',
    })
  })

  it('uses the exported error class for caller-side handling', () => {
    const error = new OfferAttachmentUploadError(
      'invalid_file_size',
      'validate',
    )

    expect(error).toBeInstanceOf(Error)
    expect(error.code).toBe('invalid_file_size')
    expect(error.stage).toBe('validate')
  })
})
