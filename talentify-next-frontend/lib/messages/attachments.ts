export const OFFER_ATTACHMENT_BUCKET = 'offer-attachments'
export const MAX_OFFER_ATTACHMENT_SIZE = 10 * 1024 * 1024
export const OFFER_ATTACHMENT_SIGNED_UPLOAD_EXPIRES_IN = 2 * 60 * 60

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export const OFFER_ATTACHMENT_MIME_TO_EXTENSION = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'application/pdf': 'pdf',
  'text/plain': 'txt',
  'text/csv': 'csv',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.ms-excel': 'xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'application/vnd.ms-powerpoint': 'ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
} as const

export type OfferAttachmentMimeType = keyof typeof OFFER_ATTACHMENT_MIME_TO_EXTENSION

export type ValidOfferAttachmentFileMetadata = {
  fileName: string
  contentType: OfferAttachmentMimeType
  size: number
  extension: string
}

export type ValidOfferAttachmentMetadata = ValidOfferAttachmentFileMetadata & {
  offerId: string
  receiverUserId: string
}

export type OfferAttachmentValidationError =
  | 'invalid_payload'
  | 'invalid_file_name'
  | 'unsupported_file_type'
  | 'invalid_file_size'

function isUuid(value: string) {
  return UUID_PATTERN.test(value)
}

export function validateOfferAttachmentFileMetadata(
  payload: unknown,
):
  | { ok: true; data: ValidOfferAttachmentFileMetadata }
  | { ok: false; error: OfferAttachmentValidationError } {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return { ok: false, error: 'invalid_payload' }
  }

  const input = payload as Record<string, unknown>
  const fileName = typeof input.fileName === 'string' ? input.fileName.trim() : ''
  const contentType =
    typeof input.contentType === 'string' ? input.contentType.trim().toLowerCase() : ''
  const size = input.size

  if (
    !fileName ||
    fileName.length > 255 ||
    /[\u0000-\u001f\u007f]/.test(fileName)
  ) {
    return { ok: false, error: 'invalid_file_name' }
  }

  if (!(contentType in OFFER_ATTACHMENT_MIME_TO_EXTENSION)) {
    return { ok: false, error: 'unsupported_file_type' }
  }

  if (
    typeof size !== 'number' ||
    !Number.isSafeInteger(size) ||
    size <= 0 ||
    size > MAX_OFFER_ATTACHMENT_SIZE
  ) {
    return { ok: false, error: 'invalid_file_size' }
  }

  const typedContentType = contentType as OfferAttachmentMimeType
  return {
    ok: true,
    data: {
      fileName,
      contentType: typedContentType,
      size,
      extension: OFFER_ATTACHMENT_MIME_TO_EXTENSION[typedContentType],
    },
  }
}

export function validateOfferAttachmentMetadata(
  payload: unknown,
):
  | { ok: true; data: ValidOfferAttachmentMetadata }
  | { ok: false; error: OfferAttachmentValidationError } {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return { ok: false, error: 'invalid_payload' }
  }

  const input = payload as Record<string, unknown>
  const offerId = typeof input.offerId === 'string' ? input.offerId.trim() : ''
  const receiverUserId =
    typeof input.receiverUserId === 'string' ? input.receiverUserId.trim() : ''

  if (!isUuid(offerId) || !isUuid(receiverUserId)) {
    return { ok: false, error: 'invalid_payload' }
  }

  const fileValidation = validateOfferAttachmentFileMetadata(input)
  if (fileValidation.ok === false) {
    return fileValidation
  }

  return {
    ok: true,
    data: {
      offerId,
      receiverUserId,
      ...fileValidation.data,
    },
  }
}
