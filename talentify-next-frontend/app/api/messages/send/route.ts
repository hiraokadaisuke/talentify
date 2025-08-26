import { NextRequest, NextResponse } from 'next/server'
import { messages, threads, nextMessageId, nextThreadId, ThreadType } from '../data'

export async function POST(req: NextRequest) {
  const { receiverUserId, body, offerId, senderUserId = 'u1' } = await req.json()

  if (!receiverUserId || !body) {
    return NextResponse.json(
      { error: 'receiverUserId and body are required' },
      { status: 400 }
    )
  }

  const type: ThreadType = offerId ? 'offer' : 'direct'

  let thread = threads.find((t) => {
    if (t.type !== type) return false
    if (type === 'offer') {
      return t.offerId === offerId && t.participants.includes(receiverUserId)
    }
    return (
      t.participants.includes(senderUserId) && t.participants.includes(receiverUserId)
    )
  })

  if (!thread) {
    thread = {
      id: nextThreadId(),
      type,
      participants: [senderUserId, receiverUserId],
      ...(offerId ? { offerId } : {}),
    }
    threads.push(thread)
  }

  const message = {
    id: nextMessageId(),
    threadId: thread.id,
    senderUserId,
    body,
    createdAt: new Date().toISOString(),
    readBy: [senderUserId],
  }

  messages.push(message)
  thread.lastMessageAt = message.createdAt

  return NextResponse.json({ data: message, threadId: thread.id })
}
