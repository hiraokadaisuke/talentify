import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import {
  createNotification,
  countUnreadNotificationsByUser,
  findNotificationsByUser,
} from '@/lib/repositories/notifications'
import type { Json } from '@/types/supabase'
import { isNotificationType } from '@/types/notifications'

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
    const { user } = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    const params = req.nextUrl.searchParams
    const unreadCountOnly = params.get('unread_count') === 'true'

    if (unreadCountOnly) {
      const count = await countUnreadNotificationsByUser({ userId: user.id })
      return NextResponse.json({ count })
    }

    const limitParam = params.get('limit')
    const parsedLimit = limitParam ? Number(limitParam) : undefined
    const limit =
      typeof parsedLimit === 'number' && Number.isFinite(parsedLimit) && parsedLimit > 0
        ? Math.floor(parsedLimit)
        : undefined

    const unreadOnly = params.get('unread_only') === 'true'
    const actionableOnly = params.get('actionable_only') === 'true'
    const category = params.get('category')

    const data = await findNotificationsByUser({
      userId: user.id,
      limit,
      unreadOnly,
      actionableOnly,
      category: category === 'announcement' || category === 'notification' ? category : undefined,
    })

    return NextResponse.json({ data })
  } catch (error) {
    console.error('failed to fetch notifications', error)
    return NextResponse.json({ error: 'failed to fetch notifications' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user } = await getCurrentUser()

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

      return NextResponse.json({ data })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'failed to insert notification'
      console.error('failed to insert notification', { user_id: user.id, type, error })
      return NextResponse.json({ error: message }, { status: 400 })
    }
  } catch (error) {
    console.error('failed to insert notification', error)
    return NextResponse.json({ error: 'invalid request' }, { status: 400 })
  }
}
