import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { createServiceClient } from '@/lib/supabase/service'
import { emitNotification } from '@/lib/notifications/emit'
import { authorizeMessageTarget } from '@/lib/messages/server'
import {
  MAX_OFFER_MESSAGE_ATTACHMENTS,
  OFFER_ATTACHMENT_BUCKET,
  validateOfferMessageAttachment,
  type OfferMessageAttachment,
} from '@/lib/messages/attachments'

export const runtime = 'nodejs'

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
    const receiverUserId =
      typeof input.receiverUserId === 'string'
        ? input.receiverUserId.trim()
        : typeof input.receiverUser === 'string'
          ? input.receiverUser.trim()
          : ''
    const body = typeof input.body === 'string' ? input.body.trim() : ''
    const offerId =
      typeof input.offerId === 'string' && input.offerId.trim()
        ? input.offerId.trim()
        : null

    const rawAttachments = input.attachments
    if (rawAttachments !== undefined && !Array.isArray(rawAttachments)) {
      return NextResponse.json({ error: 'invalid_attachments' }, { status: 400 })
    }

    const attachmentInputs = Array.isArray(rawAttachments) ? rawAttachments : []

    if (!receiverUserId || (!body && attachmentInputs.length === 0)) {
      return NextResponse.json(
        { error: 'receiverUserId and body are required' },
        { status: 400 },
      )
    }
    if (body.length > 5000) {
      return NextResponse.json({ error: 'message_too_long' }, { status: 400 })
    }
    if (attachmentInputs.length > MAX_OFFER_MESSAGE_ATTACHMENTS) {
      return NextResponse.json(
        { error: 'too_many_attachments' },
        { status: 400 },
      )
    }
    if (attachmentInputs.length > 0 && !offerId) {
      return NextResponse.json(
        { error: 'attachments_require_offer' },
        { status: 400 },
      )
    }

    const attachments: OfferMessageAttachment[] = []
    const attachmentPaths = new Set<string>()

    if (offerId) {
      for (const attachmentInput of attachmentInputs) {
        const validation = validateOfferMessageAttachment(attachmentInput, {
          offerId,
          senderUserId: user.id,
        })
        if (validation.ok === false) {
          return NextResponse.json(
            { error: validation.error },
            { status: 400 },
          )
        }

        if (attachmentPaths.has(validation.data.path)) {
          return NextResponse.json(
            { error: 'duplicate_attachment' },
            { status: 400 },
          )
        }

        attachmentPaths.add(validation.data.path)
        attachments.push(validation.data)
      }
    }

    const access = await authorizeMessageTarget({
      senderUserId: user.id,
      receiverUserId,
      offerId,
    })
    if (!access.ok) {
      const status = access.reason === 'offer_not_found' ? 404 : 403
      return NextResponse.json({ error: access.reason }, { status })
    }

    const service = createServiceClient()

    if (attachments.length > 0 && offerId) {
      const folder = `${offerId}/${user.id}`
      const bucket = service.storage.from(OFFER_ATTACHMENT_BUCKET)

      for (const attachment of attachments) {
        const storageFileName = attachment.path.split('/')[2]
        const { data: objects, error: listError } = await bucket.list(folder, {
          limit: 10,
          offset: 0,
          search: storageFileName,
        })

        if (listError) {
          throw listError
        }

        const storedObject = objects?.find(
          object => object.id !== null && object.name === storageFileName,
        )
        if (!storedObject) {
          return NextResponse.json(
            { error: 'attachment_not_found' },
            { status: 400 },
          )
        }

        const metadata =
          storedObject.metadata && typeof storedObject.metadata === 'object'
            ? (storedObject.metadata as Record<string, unknown>)
            : null
        const storedSize =
          typeof metadata?.size === 'number'
            ? metadata.size
            : typeof metadata?.size === 'string'
              ? Number(metadata.size)
              : NaN
        const storedMime =
          typeof metadata?.mimetype === 'string'
            ? metadata.mimetype.toLowerCase()
            : ''

        if (
          storedSize !== attachment.size ||
          storedMime !== attachment.type
        ) {
          return NextResponse.json(
            { error: 'attachment_metadata_mismatch' },
            { status: 400 },
          )
        }
      }
    }

    const { data: message, error: insertError } = await service
      .from('offer_messages')
      .insert({
        offer_id: offerId,
        sender_user: user.id,
        receiver_user: receiverUserId,
        sender_role: access.sender.role,
        body: body || null,
        attachments,
      })
      .select('*')
      .single()

    if (insertError || !message) {
      throw insertError ?? new Error('message insert failed')
    }

    try {
      const threadId = offerId ?? [user.id, receiverUserId].sort().join(':')
      await emitNotification({
        recipientUserId: receiverUserId,
        recipientRole: access.receiver.role,
        event: {
          kind: 'message_received',
          actorName: access.sender.name,
          actorId: user.id,
          threadId,
          messageId: message.id,
          offerId,
        },
      })
    } catch (notificationError) {
      console.error('failed to insert message notification', notificationError)
    }

    return NextResponse.json({ data: message }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/messages/send]', error)
    return NextResponse.json({ error: 'message_send_failed' }, { status: 500 })
  }
}
