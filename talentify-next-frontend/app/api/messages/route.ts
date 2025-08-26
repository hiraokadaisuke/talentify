import { NextRequest, NextResponse } from 'next/server'
import { messages } from './data'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const threadId = searchParams.get('threadId')
  if (!threadId) {
    return NextResponse.json({ error: 'threadId is required' }, { status: 400 })
  }

  const limit = parseInt(searchParams.get('limit') || '20', 10)
  const cursor = searchParams.get('cursor')

  const threadMessages = messages
    .filter((m) => m.threadId === threadId)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))

  let startIndex = 0
  if (cursor) {
    const index = threadMessages.findIndex((m) => m.id === cursor)
    if (index >= 0) {
      startIndex = index + 1
    }
  }

  const data = threadMessages.slice(startIndex, startIndex + limit)
  const nextCursor = data.length === limit ? data[data.length - 1].id : null

  return NextResponse.json({ data, nextCursor })
}
