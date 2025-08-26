import { NextRequest, NextResponse } from 'next/server'
import { messages } from '../data'

export async function POST(req: NextRequest) {
  const { threadId, upToMessageId, userId = 'u1' } = await req.json()
  if (!threadId || !upToMessageId) {
    return NextResponse.json({ error: 'threadId and upToMessageId are required' }, { status: 400 })
  }

  const target = messages.find(
    m => m.id === upToMessageId && m.threadId === threadId
  )
  if (!target) {
    return NextResponse.json({ error: 'Message not found' }, { status: 404 })
  }

  const cutoff = target.createdAt
  messages
    .filter(m => m.threadId === threadId && m.createdAt <= cutoff)
    .forEach(m => {
      if (!m.readBy.includes(userId)) {
        m.readBy.push(userId)
      }
    })

  return NextResponse.json({ ok: true })
}
