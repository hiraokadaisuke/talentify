import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import {
  createNotification,
  countUnreadNotificationsByUser,
  findNotificationsByUser,
} from '@/lib/repositories/notifications'
import type { Json } from '@/types/supabase'
import { isNotificationType } from '@/types/notifications'
import { getIdempotentResponse, persistIdempotentResponse } from '@/lib/notification-idempotency'
import { buildNotificationCountFilter, buildNotificationListFilter } from '@/lib/notifications/inbox-filters'

export const runtime = 'nodejs'

function isJsonValue(value: unknown): value is Json {
  if (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return true
  }

  if (Array.isArray(value)) {
    return value.every((item) => isJsonValue(item))
  }

  if (typeof value === 'object') {
    return Object.values(value).every((item) => isJsonValue(item))
  }

  return false
}

function isPriority(value: unknown): value is 'low' | 'medium' | 'high' {
  return value === 'low' || value === 'medium' || value === 'high'
}

export async function GET(req: NextRequest) {
  try {
    const currentUserResult = await getCurrentUser()
    console.info('[auth][debug]', {
      user: currentUserResult.user,
    })
    const { user } = currentUserResult

    if (!user) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    const params = req.nextUrl.searchParams
    const countFilter = buildNotificationCountFilter({
      unreadCountOnly: params.get('unread_count') === 'true',
    })

    if (countFilter.unreadCountOnly) {
      console.info('[notifications][count][before]', {
        userId: user.id,
      })
      const count = await countUnreadNotificationsByUser({
        userId: user.id,
        actionableOnly: countFilter.actionableOnly,
        category: countFilter.category,
        includeExpired: countFilter.includeExpired,
      })
      if (process.env.NOTIFICATIONS_DEBUG_LOG === 'true') {
        console.info('[notifications][api][count]', { userId: user.id, countFilter, count })
      }
      return NextResponse.json({ count })
    }

    const limitParam = params.get('limit')
    const parsedLimit = limitParam ? Number(limitParam) : undefined
    const limit =
      typeof parsedLimit === 'number' && Number.isFinite(parsedLimit) && parsedLimit > 0
        ? Math.floor(parsedLimit)
        : undefined

    const listFilter = buildNotificationListFilter({
      unreadOnly: params.get('unread_only') === 'true',
      actionableOnly: params.get('actionable_only') === 'true',
      category: params.get('category'),
    })

    if (process.env.NOTIFICATIONS_DEBUG_LOG === 'true') {
      console.info('[notifications][api][request]', {
        userId: user.id,
        searchParams: Object.fromEntries(params.entries()),
        limit,
        listFilter,
      })
    }

    console.info('[notifications][list][before]', {
      userId: user.id,
      limit: limit ?? null,
    })

    const data = await findNotificationsByUser({
      userId: user.id,
      limit,
      ...listFilter,
    })

    if (process.env.NOTIFICATIONS_DEBUG_LOG === 'true') {
      console.info('[notifications][api][response]', { userId: user.id, resultCount: data.length, listFilter })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('failed to fetch notifications', {
      error,
      message: error instanceof Error ? error.message : null,
      stack: error instanceof Error ? error.stack : null,
    })
    return NextResponse.json({ error: 'failed to fetch notifications' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const currentUserResult = await getCurrentUser()
    console.info('[auth][debug]', {
      user: currentUserResult.user,
    })
    const { user } = currentUserResult

    if (!user) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    const {
      type,
      payload,
      data: explicitData,
      title,
      body,
      priority,
      action_url,
      action_label,
      entity_type,
      entity_id,
      actor_name,
      expires_at,
      group_key,
    } = await req.json()

    const idempotent = await getIdempotentResponse(req, user.id)
    if (idempotent) {
      return idempotent
    }

    if (!title || !isNotificationType(type)) {
      return NextResponse.json({ error: 'invalid request' }, { status: 400 })
    }

    if (priority !== undefined && !isPriority(priority)) {
      return NextResponse.json({ error: 'priority must be low|medium|high' }, { status: 400 })
    }

    try {
      const normalizedPayload = explicitData === undefined ? (payload === undefined ? null : payload) : explicitData
      if (normalizedPayload !== null && !isJsonValue(normalizedPayload)) {
        return NextResponse.json({ error: 'invalid request' }, { status: 400 })
      }

      const data = await createNotification({
        user_id: user.id,
        type,
        title,
        body: body ?? null,
        data: normalizedPayload,
        priority: priority ?? 'medium',
        action_url: typeof action_url === 'string' ? action_url : null,
        action_label: typeof action_label === 'string' ? action_label : null,
        entity_type: typeof entity_type === 'string' ? entity_type : null,
        entity_id: typeof entity_id === 'string' ? entity_id : null,
        actor_name: typeof actor_name === 'string' ? actor_name : null,
        expires_at: typeof expires_at === 'string' ? expires_at : null,
        group_key: typeof group_key === 'string' ? group_key : null,
      })

      const response = NextResponse.json({ data })
      await persistIdempotentResponse(req, user.id, response)
      return response
    } catch (error) {
      const message = error instanceof Error ? error.message : 'failed to insert notification'
      console.error('failed to insert notification', {
        user_id: user.id,
        type,
        error,
        message: error instanceof Error ? error.message : null,
        stack: error instanceof Error ? error.stack : null,
      })
      return NextResponse.json({ error: message }, { status: 400 })
    }
  } catch (error) {
    console.error('failed to insert notification', {
      error,
      message: error instanceof Error ? error.message : null,
      stack: error instanceof Error ? error.stack : null,
    })
    return NextResponse.json({ error: 'invalid request' }, { status: 400 })
  }
}
