import { NextRequest, NextResponse } from 'next/server'
import { messages, threads } from '../data'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId') || 'u1'

  const count = messages.filter(m => {
    const thread = threads.find(t => t.id === m.threadId)
    if (!thread) return false
    return (
      thread.participants.includes(userId) &&
      m.senderUserId !== userId &&
      !m.readBy.includes(userId)
    )
  }).length

  return NextResponse.json({ count })
}
