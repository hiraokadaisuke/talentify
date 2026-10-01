import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { createServiceClient } from '@/lib/supabase/service'
import {
  OFFER_ATTACHMENT_BUCKET,
  OFFER_ATTACHMENT_SIGNED_DOWNLOAD_EXPIRES_IN,
  validateOfferMessageAttachment,
} from '@/lib/messages/attachments'

export const runtime = 'nodejs'

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function POST(req: NextRequest) {
  try {
    const { user, error: userError } = await getCurrentUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    const payload = await req.json().catch(() => null)
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      return NextResponse.json({ error: 'invalid_payload' }, { status: 400 })
    }

    const input = payload as Record<string, unknown>
    const messageId =
      typeof input.messageId === 'string' ? input.messageId.trim() : ''
    const path = typeof input.path === 'string' ? input.path.trim() : ''
    const download = input.download === true

    if (!UUID_PATTERN.test(messageId) || !path || path.length > 1024) {
      return NextResponse.json({ error: 'invalid_payload' }, { status: 400 })
    }
    if (
      input.download !== undefined &&
      typeof input.download !== 'boolean'
    ) {
      return NextResponse.json({ error: 'invalid_payload' }, { status: 400 })
    }

    const service = createServiceClient()
    const { data: message, error: messageError } = await service
      .from('offer_messages')
      .select('id,offer_id,sender_user,receiver_user,attachments')
      .eq('id', messageId)
      .maybeSingle()

    if (messageError) {
      throw messageError
    }
    if (!message) {
      return NextResponse.json({ error: 'message_not_found' }, { status: 404 })
    }

    if (
      message.sender_user !== user.id &&
      message.receiver_user !== user.id
    ) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 })
    }

    if (!message.offer_id || !Array.isArray(message.attachments)) {
      return NextResponse.json({ error: 'attachment_not_found' }, { status: 404 })
    }

    const rawAttachment = message.attachments.find(
      attachment =>
        !!attachment &&
        typeof attachment === 'object' &&
        !Array.isArray(attachment) &&
        (attachment as Record<string, unknown>).path === path,
    )

    if (!rawAttachment) {
      return NextResponse.json({ error: 'attachment_not_found' }, { status: 404 })
    }

    const validation = validateOfferMessageAttachment(rawAttachment, {
      offerId: message.offer_id,
      senderUserId: message.sender_user,
    })

    if (validation.ok === false || validation.data.path !== path) {
      return NextResponse.json({ error: 'attachment_not_found' }, { status: 404 })
    }

    const bucket = service.storage.from(OFFER_ATTACHMENT_BUCKET)
    const { data: signed, error: signedError } = await bucket.createSignedUrl(
      validation.data.path,
      OFFER_ATTACHMENT_SIGNED_DOWNLOAD_EXPIRES_IN,
      download ? { download: true } : undefined,
    )

    if (signedError || !signed?.signedUrl) {
      throw signedError ?? new Error('signed download url creation failed')
    }

    return NextResponse.json({
      data: {
        url: signed.signedUrl,
        expiresIn: OFFER_ATTACHMENT_SIGNED_DOWNLOAD_EXPIRES_IN,
        attachment: validation.data,
      },
    })
  } catch (error) {
    console.error('[POST /api/messages/attachments/download-url]', error)
    return NextResponse.json(
      { error: 'attachment_download_url_failed' },
      { status: 500 },
    )
  }
}
