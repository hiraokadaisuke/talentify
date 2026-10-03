import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/supabase'

export const runtime = 'nodejs'

const BELL_LIMIT = 8
const FETCH_LIMIT = 24
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

type NotificationRow = Database['public']['Tables']['notifications']['Row']

const priorityRank: Record<string, number> = {
  high: 2,
  medium: 1,
  low: 0,
}

function sortForBell(items: NotificationRow[]) {
  return [...items]
    .sort((a, b) => {
      const priorityDiff =
        (priorityRank[b.priority ?? 'medium'] ?? 1) -
        (priorityRank[a.priority ?? 'medium'] ?? 1)
      if (priorityDiff !== 0) return priorityDiff

      const bTime = new Date(b.updated_at ?? b.created_at).getTime()
      const aTime = new Date(a.updated_at ?? a.created_at).getTime()
      return bTime - aTime
    })
    .slice(0, BELL_LIMIT)
}

export async function GET(request: NextRequest) {
  try {
    const userId = headers().get('x-raiten-user-id')
    if (!userId || !UUID_PATTERN.test(userId)) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    const supabase = createClient()
    const countOnly = request.nextUrl.searchParams.get('count_only') === 'true'

    if (countOnly) {
      const { count, error } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false)

      if (error) {
        console.error('[notifications][api][bell] count failed', {
          userId: userId,
          error,
        })
        return NextResponse.json({ error: 'failed to fetch bell count' }, { status: 500 })
      }

      return NextResponse.json({ count: count ?? 0 })
    }

    // Full notification rows are fetched only when the bell menu is opened.
    const { data, error, count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .eq('is_read', false)
      .order('updated_at', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(FETCH_LIMIT)

    if (error) {
      console.error('[notifications][api][bell] failed', {
        stage: 'fetchNotifications',
        userId: userId,
        error,
      })
      return NextResponse.json(
        { error: 'failed to fetch bell notifications' },
        { status: 500 },
      )
    }

    return NextResponse.json({
      count: count ?? data?.length ?? 0,
      items: sortForBell((data ?? []) as NotificationRow[]),
    })
  } catch (error) {
    console.error('[notifications][api][bell] failed', {
      stage: 'unexpected',
      error,
      message: error instanceof Error ? error.message : null,
    })
    return NextResponse.json(
      { error: 'failed to fetch bell notifications' },
      { status: 500 },
    )
  }
}
