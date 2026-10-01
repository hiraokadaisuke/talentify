'use client'

export class OfferAttachmentDownloadUrlError extends Error {
  readonly code: string
  readonly status?: number

  constructor(code: string, status?: number) {
    super(code)
    this.name = 'OfferAttachmentDownloadUrlError'
    this.code = code
    this.status = status
  }
}

type AttachmentDownloadUrlResponse = {
  data: {
    url: string
    expiresIn: number
    attachment: {
      path: string
      name: string
      type: string
      size: number
    }
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function parseResponse(payload: unknown, requestedPath: string) {
  if (!isRecord(payload) || !isRecord(payload.data)) return null

  const data = payload.data
  if (
    typeof data.url !== 'string' ||
    !data.url ||
    typeof data.expiresIn !== 'number' ||
    data.expiresIn <= 0 ||
    !isRecord(data.attachment) ||
    data.attachment.path !== requestedPath
  ) {
    return null
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl) return null

  try {
    const signedUrl = new URL(data.url)
    const expectedOrigin = new URL(supabaseUrl).origin
    if (
      signedUrl.protocol !== 'https:' ||
      signedUrl.origin !== expectedOrigin
    ) {
      return null
    }
  } catch {
    return null
  }

  return {
    url: data.url,
    expiresIn: data.expiresIn,
  }
}

export async function getOfferAttachmentDownloadUrl(params: {
  messageId: string
  path: string
  download?: boolean
  signal?: AbortSignal
}) {
  let response: Response
  try {
    response = await fetch('/api/messages/attachments/download-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messageId: params.messageId,
        path: params.path,
        download: params.download === true,
      }),
      signal: params.signal,
    })
  } catch (error) {
    if (
      typeof DOMException !== 'undefined' &&
      error instanceof DOMException &&
      error.name === 'AbortError'
    ) {
      throw error
    }

    throw new OfferAttachmentDownloadUrlError(
      'attachment_download_url_request_failed',
    )
  }

  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    const code =
      isRecord(payload) && typeof payload.error === 'string'
        ? payload.error
        : 'attachment_download_url_failed'
    throw new OfferAttachmentDownloadUrlError(code, response.status)
  }

  const parsed = parseResponse(payload, params.path)
  if (!parsed) {
    throw new OfferAttachmentDownloadUrlError(
      'invalid_attachment_download_url_response',
      response.status,
    )
  }

  return parsed
}
