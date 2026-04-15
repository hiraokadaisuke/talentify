import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { countUnreadNotificationsByUser, findNotificationsByUser } from '@/lib/repositories/notifications'

export const runtime = 'nodejs'

const BELL_LIMIT = 8

const bellFilter = {
  unreadOnly: true,
  actionableOnly: false,
  includeExpired: false,
  category: undefined,
} as const

export async function GET() {
  try {
    const { user } = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    const [count, items] = await Promise.all([
      countUnreadNotificationsByUser({ userId: user.id, ...bellFilter }),
      findNotificationsByUser({ userId: user.id, limit: BELL_LIMIT, ...bellFilter }),
    ])

    if (process.env.NOTIFICATIONS_DEBUG_LOG === 'true') {
      console.info('[notifications][api][bell]', {
        userId: user.id,
        bellFilter,
        count,
        itemCount: items.length,
      })
    }

    return NextResponse.json({ count, items })
  } catch (error) {
    console.error('failed to fetch bell notifications', error)
    return NextResponse.json({ error: 'failed to fetch bell notifications' }, { status: 500 })
  }
}
