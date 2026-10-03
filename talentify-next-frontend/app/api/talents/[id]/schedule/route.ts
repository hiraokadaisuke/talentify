import { NextResponse } from 'next/server'

import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { getTodayJstDateString } from '@/utils/jstDate'

type RouteContext = {
  params: {
    id: string
  }
}

function pad(value: number) {
  return String(value).padStart(2, '0')
}

function buildRange() {
  const today = getTodayJstDateString()
  const [year, month] = today.split('-').map(Number)
  const from = `${year}-${pad(month)}-01`

  const endMonthIndex = month - 1 + 3
  const endYear = year + Math.floor(endMonthIndex / 12)
  const normalizedEndMonthIndex = endMonthIndex % 12
  const lastDay = new Date(endYear, normalizedEndMonthIndex + 1, 0).getDate()
  const to = `${endYear}-${pad(normalizedEndMonthIndex + 1)}-${pad(lastDay)}`

  return { from, to }
}

function toJstDateString(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null

  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)

  const map = Object.fromEntries(parts.map(part => [part.type, part.value]))
  if (!map.year || !map.month || !map.day) return null
  return `${map.year}-${map.month}-${map.day}`
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { user } = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 })
  }

  const supabase = await createClient()
  const { data: store, error: storeError } = await supabase
    .from('stores')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (storeError) {
    console.error('[talent schedule] failed to resolve store', storeError)
    return NextResponse.json({ error: '店舗情報の取得に失敗しました' }, { status: 500 })
  }

  if (!store) {
    return NextResponse.json({ error: '店舗アカウントで利用してください' }, { status: 403 })
  }

  const service = createServiceClient()
  const { data: talent, error: talentError } = await service
    .from('talents')
    .select('id,user_id')
    .eq('id', params.id)
    .maybeSingle()

  if (talentError) {
    console.error('[talent schedule] failed to resolve talent', talentError)
    return NextResponse.json({ error: '演者情報の取得に失敗しました' }, { status: 500 })
  }

  if (!talent?.user_id) {
    return NextResponse.json({ error: '演者が見つかりません' }, { status: 404 })
  }

  const { from, to } = buildRange()
  const fromIso = new Date(`${from}T00:00:00+09:00`).toISOString()
  const toIso = new Date(`${to}T23:59:59+09:00`).toISOString()

  const [{ data: availabilityRows, error: availabilityError }, { data: offerRows, error: offerError }] =
    await Promise.all([
      service
        .from('talent_availability_dates')
        .select('the_date,status')
        .eq('user_id', talent.user_id)
        .eq('status', 'ng')
        .gte('the_date', from)
        .lte('the_date', to),
      service
        .from('offers')
        .select('date,store_id')
        .eq('talent_id', talent.id)
        .eq('status', 'confirmed')
        .gte('date', fromIso)
        .lte('date', toIso),
    ])

  if (availabilityError || offerError) {
    console.error('[talent schedule] failed to load schedule', {
      availabilityError,
      offerError,
    })
    return NextResponse.json({ error: 'スケジュールの取得に失敗しました' }, { status: 500 })
  }

  const storeIds = [
    ...new Set(
      (offerRows ?? [])
        .map(row => row.store_id)
        .filter((id): id is string => Boolean(id))
    ),
  ]

  const prefectureByStoreId = new Map<string, string>()
  if (storeIds.length > 0) {
    const { data: storeRows, error: storeRowsError } = await service
      .from('stores')
      .select('id,store_prefect')
      .in('id', storeIds)

    if (storeRowsError) {
      console.error('[talent schedule] failed to load visit prefectures', storeRowsError)
      return NextResponse.json({ error: 'スケジュールの取得に失敗しました' }, { status: 500 })
    }

    for (const row of storeRows ?? []) {
      if (row.store_prefect) {
        prefectureByStoreId.set(row.id, row.store_prefect)
      }
    }
  }

  const visitPrefecturesByDate = new Map<string, Set<string>>()
  for (const offer of offerRows ?? []) {
    const date = toJstDateString(offer.date)
    if (!date) continue
    const prefecture = offer.store_id ? prefectureByStoreId.get(offer.store_id) : null
    const current = visitPrefecturesByDate.get(date) ?? new Set<string>()
    if (prefecture) current.add(prefecture)
    visitPrefecturesByDate.set(date, current)
  }

  return NextResponse.json({
    from,
    to,
    unavailableDates: (availabilityRows ?? []).map(row => row.the_date),
    visits: [...visitPrefecturesByDate.entries()].map(([date, prefectures]) => ({
      date,
      prefectures: [...prefectures],
    })),
  })
}
