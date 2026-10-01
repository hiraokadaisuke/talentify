import { randomUUID } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { authorizeMessageTarget } from '@/lib/messages/server'
import {
  OFFER_ATTACHMENT_BUCKET,
  OFFER_ATTACHMENT_SIGNED_UPLOAD_EXPIRES_IN,
  validateOfferAttachmentMetadata,
} from '@/lib/messages/attachments'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { user, error: userError } = await getCurrentUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    const payload = await req.json().catch(() => null)
    const validation = validateOfferAttachmentMetadata(payload)
    if (!validation.ok) {
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
    return NextResponse.json(
      {
        error: 'signed_upload_diagnostic',
        data: {
          bucket: OFFER_ATTACHMENT_BUCKET,
          path,
          expiresIn: OFFER_ATTACHMENT_SIGNED_UPLOAD_EXPIRES_IN,
          attachment: {
            path,
            name: fileName,
            type: contentType,
            size,
          },
        },
      },
      { status: 501 },
    )
  } catch (error) {
    console.error('[POST /api/messages/attachments/upload-url]', error)
    return NextResponse.json(
      { error: 'signed_upload_url_failed' },
      { status: 500 },
    )
  }
}
