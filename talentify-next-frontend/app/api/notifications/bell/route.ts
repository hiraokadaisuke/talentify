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
  let user: { id?: string } | null = null

  try {
    const currentUserResult = await getCurrentUser()
    console.info('[notifications][api][bell] getCurrentUser result', currentUserResult)
    user = currentUserResult.user
  } catch (error) {
    console.error('[notifications][api][bell] failed to get current user', { error })
    console.error('failed to fetch bell notifications', {
      error,
      userId: user?.id,
    })
    return NextResponse.json({ error: 'failed to fetch bell notifications' }, { status: 500 })
  }

  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  if (!user.id) {
    console.error('[notifications][api][bell] user.id is undefined', { user })
    return NextResponse.json({ error: 'failed to fetch bell notifications' }, { status: 500 })
  }

  let count = 0
  try {
    count = await countUnreadNotificationsByUser({ userId: user.id, ...bellFilter })
  } catch (error) {
    console.error('[notifications][api][bell] failed to fetch unread count', {
      error,
      userId: user.id,
      bellFilter,
    })
    console.error('failed to fetch bell notifications', {
      error,
      userId: user?.id,
    })
    return NextResponse.json({ error: 'failed to fetch bell notifications' }, { status: 500 })
  }

  let items: Awaited<ReturnType<typeof findNotificationsByUser>> = []
  try {
    items = await findNotificationsByUser({ userId: user.id, limit: BELL_LIMIT, ...bellFilter })
  } catch (error) {
    console.error('[notifications][api][bell] failed to fetch notifications list', {
      error,
      userId: user.id,
      bellFilter,
      limit: BELL_LIMIT,
    })
    console.error('failed to fetch bell notifications', {
      error,
      userId: user?.id,
    })
    return NextResponse.json({ error: 'failed to fetch bell notifications' }, { status: 500 })
  }

  if (process.env.NOTIFICATIONS_DEBUG_LOG === 'true') {
    console.info('[notifications][api][bell]', {
      userId: user.id,
      bellFilter,
      count,
      itemCount: items.length,
    })
  }

  return NextResponse.json({ count, items })
}
