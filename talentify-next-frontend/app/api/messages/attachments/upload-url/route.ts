import { randomUUID } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { authorizeMessageTarget } from '@/lib/messages/server'
import {
  OFFER_ATTACHMENT_BUCKET,
  OFFER_ATTACHMENT_SIGNED_UPLOAD_EXPIRES_IN,
  validateOfferAttachmentMetadata,
} from '@/lib/messages/attachments'
import { createServiceClient } from '@/lib/supabase/service'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { user, error: userError } = await getCurrentUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    const payload = await req.json().catch(() => null)
    const validation = validateOfferAttachmentMetadata(payload)
    if (validation.ok === false) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const {
      offerId,
      receiverUserId,
      fileName,
      contentType,
      size,
      extension,
    } = validation.data

    const access = await authorizeMessageTarget({
      senderUserId: user.id,
      receiverUserId,
      offerId,
    })
    if (!access.ok) {
      const status = access.reason === 'offer_not_found' ? 404 : 403
      return NextResponse.json({ error: access.reason }, { status })
    }

    const path = `${offerId}/${user.id}/${randomUUID()}.${extension}`
    const service = createServiceClient()
    const { data, error } = await service.storage
      .from(OFFER_ATTACHMENT_BUCKET)
      .createSignedUploadUrl(path)

    if (error || !data) {
      console.error('[offer attachment signed upload]', error)
      return NextResponse.json(
        { error: 'signed_upload_url_failed' },
        { status: 500 },
      )
    }

    const token = data.token
    if (!token) {
      console.error('[offer attachment signed upload] token missing')
      return NextResponse.json(
        { error: 'signed_upload_url_failed' },
        { status: 500 },
      )
    }

    return NextResponse.json(
      {
        data: {
          bucket: OFFER_ATTACHMENT_BUCKET,
          path,
          token,
          expiresIn: OFFER_ATTACHMENT_SIGNED_UPLOAD_EXPIRES_IN,
          attachment: {
            path,
            name: fileName,
            type: contentType,
            size,
          },
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error('[POST /api/messages/attachments/upload-url]', error)
    return NextResponse.json(
      { error: 'signed_upload_url_failed' },
      { status: 500 },
    )
  }
}
