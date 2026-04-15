import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { countUnreadNotificationsByUser, findNotificationsByUser } from '@/lib/repositories/notifications'

export const runtime = 'nodejs'

const BELL_LIMIT = 8

const bellFilter = {
  unreadOnly: true,
  actionableOnly: false,
  category: undefined,
} as const

type BellFailureStage = 'getCurrentUser' | 'fetchUnreadCount' | 'fetchNotificationsList'

function logBellFailure({
  stage,
  error,
  userId,
}: {
  stage: BellFailureStage
  error: unknown
  userId?: string
}) {
  console.error('[notifications][api][bell] failed', {
    stage,
    userId,
    bellFilter,
    limit: BELL_LIMIT,
    error,
    message: error instanceof Error ? error.message : null,
    stack: error instanceof Error ? error.stack : null,
  })
}

export async function GET() {
  let user: { id?: string } | null = null

  try {
    const currentUserResult = await getCurrentUser()
    console.info('[auth][debug]', {
      user: currentUserResult.user,
    })
    user = currentUserResult.user
  } catch (error) {
    logBellFailure({
      stage: 'getCurrentUser',
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
    console.info('[notifications][count][before]', {
      userId: user.id,
    })
    count = await countUnreadNotificationsByUser({ userId: user.id, ...bellFilter })
  } catch (error) {
    logBellFailure({
      stage: 'fetchUnreadCount',
      error,
      userId: user.id,
    })
    return NextResponse.json({ error: 'failed to fetch bell notifications' }, { status: 500 })
  }

  let items: Awaited<ReturnType<typeof findNotificationsByUser>> = []
  try {
    console.info('[notifications][list][before]', {
      userId: user.id,
      limit: BELL_LIMIT,
    })
    items = await findNotificationsByUser({ userId: user.id, limit: BELL_LIMIT, ...bellFilter })
  } catch (error) {
    logBellFailure({
      stage: 'fetchNotificationsList',
      error,
      userId: user.id,
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
