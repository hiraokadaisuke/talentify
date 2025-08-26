import { NextRequest, NextResponse } from 'next/server'
import { messages, threads } from '../data'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') // 'direct' | 'offer'
  const userId = searchParams.get('userId')

  let filtered = threads
  if (type) {
    filtered = filtered.filter((t) => t.type === type)
  }

  const result = filtered
    .map((t) => {
      const threadMessages = messages.filter((m) => m.threadId === t.id)
      const lastMessageAt = threadMessages
        .reduce((acc, m) => (acc > m.createdAt ? acc : m.createdAt), t.lastMessageAt ?? '')
      const unreadCount = userId
        ? threadMessages.filter((m) => !m.readBy.includes(userId)).length
        : 0
      return {
        id: t.id,
        type: t.type,
        offerId: t.offerId,
        last_message_at: lastMessageAt,
        unreadCount,
      }
    })
    .sort((a, b) => (a.last_message_at < b.last_message_at ? 1 : -1))

  return NextResponse.json({ data: result })
}
