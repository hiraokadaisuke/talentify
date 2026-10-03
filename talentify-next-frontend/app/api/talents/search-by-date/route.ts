import { NextRequest } from 'next/server'
import { z } from 'zod'
import type { Database } from '@/types/supabase'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { getTodayJstDateString } from '@/utils/jstDate'
import {
  isDeclaredAvailable,
  isValidSearchWindow,
  matchesTalentFilter,
} from '@/lib/search/calendarAvailability'

const TIME_PATTERN = /^\d{2}:\d{2}$/

const querySchema = z
  .object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    start: z.string().regex(TIME_PATTERN).optional(),
    end: z.string().regex(TIME_PATTERN).optional(),
    area: z.string().trim().max(100).optional(),
    genre: z.string().trim().max(100).optional(),
  })
  .refine(value => Boolean(value.start) === Boolean(value.end), {
    message: 'start and end must be provided together',
    path: ['start'],
  })

type TalentRow = Pick<
  Database['public']['Tables']['talents']['Row'],
  | 'id'
  | 'user_id'
  | 'stage_name'
  | 'display_name'
  | 'genre'
  | 'area'
  | 'avatar_url'
  | 'rate'
  | 'rating'
  | 'bio'
  | 'achievements'
  | 'media_appearance'
>

export type TalentSearchResult = {
  id: string
  stage_name: string | null
  display_name: string | null
  genre: string | null
  area: string | null
  avatar_url: string | null
  rate: number | null
  rating: number | null
  bio: string | null
  achievements: string | null
  availability_status: 'ok'
}

function nextDateString(date: string) {
  const next = new Date(`${date}T00:00:00.000Z`)
  next.setUTCDate(next.getUTCDate() + 1)
  return next.toISOString().slice(0, 10)
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function GET(request: NextRequest) {
  const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries())
  const parsed = querySchema.safeParse(searchParams)

  if (!parsed.success) {
    return jsonResponse({ error: '日付と時間帯を確認してください' }, 400)
  }

  const { date, start, end, area, genre } = parsed.data
  if (date < getTodayJstDateString()) {
    return jsonResponse({ error: '本日以降の日付を選択してください' }, 400)
  }
  if (start && end && !isValidSearchWindow(start, end)) {
    return jsonResponse({ error: '終了時刻は開始時刻より後を選択してください' }, 400)
  }

  const { user, error: userError } = await getCurrentUser()
  if (userError || !user) {
    return jsonResponse({ error: 'ログインが必要です' }, 401)
  }

  const supabase = await createClient()
  const { data: store, error: storeError } = await supabase
    .from('stores')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (storeError || !store) {
    return jsonResponse({ error: '店舗アカウントで利用してください' }, 403)
  }

  const service = createServiceClient()
  const { data: talentRows, error: talentError } = await service
    .from('talents')
    .select(
      'id,user_id,stage_name,display_name,genre,area,avatar_url,rate,rating,bio,achievements,media_appearance'
    )
    .eq('is_profile_complete', true)
    .order('stage_name', { ascending: true })
    .limit(200)

  if (talentError) {
    console.error('[calendar search] talent query failed', talentError)
    return jsonResponse({ error: '演者の取得に失敗しました' }, 500)
  }

  const candidates = ((talentRows ?? []) as TalentRow[]).filter(
    talent =>
      Boolean(talent.user_id) &&
      matchesTalentFilter(talent, area || undefined, genre || undefined)
  )

  if (candidates.length === 0) {
    return jsonResponse([])
  }

  const userIds = [...new Set(candidates.map(talent => talent.user_id).filter((id): id is string => Boolean(id)))]

  const [{ data: settings, error: settingsError }, { data: overrides, error: overridesError }] =
    await Promise.all([
      service
        .from('talent_availability_settings')
        .select('user_id,default_mode')
        .in('user_id', userIds),
      service
        .from('talent_availability_dates')
        .select('user_id,status')
        .eq('the_date', date)
        .in('user_id', userIds),
    ])

  if (settingsError || overridesError) {
    console.error('[calendar search] availability query failed', {
      settingsError,
      overridesError,
    })
    return jsonResponse({ error: 'スケジュールの取得に失敗しました' }, 500)
  }

  const defaultModeByUser = new Map(
    (settings ?? []).map(row => [row.user_id, row.default_mode] as const)
  )
  const overrideByUser = new Map(
    (overrides ?? []).map(row => [row.user_id, row.status] as const)
  )

  const declaredAvailable = candidates.filter(talent => {
    if (!talent.user_id) return false
    return isDeclaredAvailable(
      defaultModeByUser.get(talent.user_id),
      overrideByUser.get(talent.user_id)
    )
  })

  if (declaredAvailable.length === 0) {
    return jsonResponse([])
  }

  const toResult = (talent: TalentRow): TalentSearchResult => ({
    id: talent.id,
    stage_name: talent.stage_name,
    display_name: talent.display_name ?? talent.stage_name,
    genre: talent.genre,
    area: talent.area,
    avatar_url: talent.avatar_url,
    rate: talent.rate,
    rating: talent.rating,
    bio: talent.bio,
    achievements: talent.achievements ?? talent.media_appearance,
    availability_status: 'ok',
  })

  if (!start || !end) {
    return jsonResponse(declaredAvailable.map(toResult))
  }

  const talentIds = declaredAvailable.map(talent => talent.id)
  const requestStart = `${date}T${start}:00`
  const requestEnd = `${date}T${end}:00`
  const dateStart = `${date}T00:00:00.000Z`
  const dateEnd = `${nextDateString(date)}T00:00:00.000Z`

  const { data: conflicts, error: conflictError } = await service
    .from('offers')
    .select('talent_id')
    .in('talent_id', talentIds)
    .in('status', ['confirmed', 'completed'])
    .gte('date', dateStart)
    .lt('date', dateEnd)
    .lt('start_time', requestEnd)
    .gt('end_time', requestStart)

  if (conflictError) {
    console.error('[calendar search] conflict query failed', conflictError)
    return jsonResponse({ error: 'スケジュールの確認に失敗しました' }, 500)
  }

  const conflictingTalentIds = new Set(
    (conflicts ?? [])
      .map(row => row.talent_id)
      .filter((id): id is string => Boolean(id))
  )

  const results: TalentSearchResult[] = declaredAvailable
    .filter(talent => !conflictingTalentIds.has(talent.id))
    .map(toResult)

  return jsonResponse(results)
}
