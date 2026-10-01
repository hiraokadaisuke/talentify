'use client'

import { createClient } from '@/lib/supabase/client'
import {
  OFFER_ATTACHMENT_BUCKET,
  validateOfferAttachmentFileMetadata,
  validateOfferAttachmentMetadata,
  type OfferAttachmentMimeType,
} from '@/lib/messages/attachments'

export type OfferAttachmentUploadStage = 'validate' | 'prepare' | 'upload'

export class OfferAttachmentUploadError extends Error {
  readonly code: string
  readonly stage: OfferAttachmentUploadStage
  readonly status?: number

  constructor(
    code: string,
    stage: OfferAttachmentUploadStage,
    status?: number,
  ) {
    super(code)
    this.name = 'OfferAttachmentUploadError'
    this.code = code
    this.stage = stage
    this.status = status
  }
}

export type UploadedOfferAttachment = {
  bucket: typeof OFFER_ATTACHMENT_BUCKET
  path: string
  name: string
  type: OfferAttachmentMimeType
  size: number
}

export type UploadOfferAttachmentParams = {
  offerId: string
  receiverUserId: string
  file: File
  signal?: AbortSignal
}

type SignedUploadData = {
  bucket: typeof OFFER_ATTACHMENT_BUCKET
  path: string
  token: string
  attachment: {
    path: string
    name: string
    type: OfferAttachmentMimeType
    size: number
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function getApiErrorCode(payload: unknown) {
  if (!isRecord(payload) || typeof payload.error !== 'string') return null
  return payload.error
}

function parseSignedUploadData(payload: unknown): SignedUploadData | null {
  if (!isRecord(payload) || !isRecord(payload.data)) return null

  const data = payload.data
  if (
    data.bucket !== OFFER_ATTACHMENT_BUCKET ||
    typeof data.path !== 'string' ||
    !data.path ||
    typeof data.token !== 'string' ||
    !data.token ||
    !isRecord(data.attachment)
  ) {
    return null
  }

  const attachment = data.attachment
  if (
    attachment.path !== data.path ||
    typeof attachment.name !== 'string' ||
    !attachment.name ||
    typeof attachment.type !== 'string' ||
    typeof attachment.size !== 'number'
  ) {
    return null
  }

  const validation = validateOfferAttachmentFileMetadata({
    fileName: attachment.name,
    contentType: attachment.type,
    size: attachment.size,
  })

  if (validation.ok === false) return null

  return {
    bucket: OFFER_ATTACHMENT_BUCKET,
    path: data.path,
    token: data.token,
    attachment: {
      path: data.path,
      name: validation.data.fileName,
      type: validation.data.contentType,
      size: validation.data.size,
    },
  }
}

function isAbortError(error: unknown) {
  return (
    typeof DOMException !== 'undefined' &&
    error instanceof DOMException &&
    error.name === 'AbortError'
  )
}

export async function uploadOfferAttachment({
  offerId,
  receiverUserId,
  file,
  signal,
}: UploadOfferAttachmentParams): Promise<UploadedOfferAttachment> {
  const validation = validateOfferAttachmentMetadata({
    offerId,
    receiverUserId,
    fileName: file.name,
    contentType: file.type,
    size: file.size,
  })

  if (validation.ok === false) {
    throw new OfferAttachmentUploadError(validation.error, 'validate')
  }

  let response: Response
  try {
    response = await fetch('/api/messages/attachments/upload-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        offerId: validation.data.offerId,
        receiverUserId: validation.data.receiverUserId,
        fileName: validation.data.fileName,
        contentType: validation.data.contentType,
        size: validation.data.size,
      }),
      signal,
    })
  } catch (error) {
    if (isAbortError(error)) throw error
    throw new OfferAttachmentUploadError(
      'signed_upload_url_request_failed',
      'prepare',
    )
  }

  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    throw new OfferAttachmentUploadError(
      getApiErrorCode(payload) ?? 'signed_upload_url_failed',
      'prepare',
      response.status,
    )
  }

  const signedUpload = parseSignedUploadData(payload)
  if (
    !signedUpload ||
    signedUpload.attachment.name !== validation.data.fileName ||
    signedUpload.attachment.type !== validation.data.contentType ||
    signedUpload.attachment.size !== validation.data.size
  ) {
    throw new OfferAttachmentUploadError(
      'invalid_signed_upload_response',
      'prepare',
      response.status,
    )
  }

  const supabase = createClient()

  let uploadResult
  try {
    uploadResult = await supabase.storage
      .from(signedUpload.bucket)
      .uploadToSignedUrl(
        signedUpload.path,
        signedUpload.token,
        file,
      )
  } catch {
    throw new OfferAttachmentUploadError('storage_upload_failed', 'upload')
  }

  if (uploadResult.error || !uploadResult.data) {
    throw new OfferAttachmentUploadError('storage_upload_failed', 'upload')
  }

  if (uploadResult.data.path !== signedUpload.path) {
    throw new OfferAttachmentUploadError(
      'invalid_storage_upload_response',
      'upload',
    )
  }

  return {
    bucket: signedUpload.bucket,
    path: signedUpload.path,
    name: signedUpload.attachment.name,
    type: signedUpload.attachment.type,
    size: signedUpload.attachment.size,
  }
}
