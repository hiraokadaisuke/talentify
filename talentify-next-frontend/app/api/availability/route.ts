import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'

import { createClient } from '@/lib/supabase/server'

const querySchema = z
  .object({
    user_id: z.string().uuid('user_id must be a valid UUID').optional(),
    talent_id: z.string().uuid('talent_id must be a valid UUID').optional(),
    from: z
      .string()
      .refine((value) => !Number.isNaN(Date.parse(value)), 'from must be a date'),
    to: z
      .string()
      .refine((value) => !Number.isNaN(Date.parse(value)), 'to must be a date'),
  })
  .refine((value) => Boolean(value.user_id || value.talent_id), {
    message: 'user_id or talent_id is required',
    path: ['user_id'],
  })

export async function GET(request: NextRequest) {
  const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries())
  const parsed = querySchema.safeParse(searchParams)

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid query parameters', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { user_id: queryUserId, talent_id: queryTalentId, from, to } = parsed.data

  // Resolve user id
  let resolvedUserId = queryUserId ?? null

  if (!resolvedUserId && queryTalentId) {
    const { data: talentRow, error: talentError } = await supabase
      .from('talents')
      .select('user_id')
      .eq('id', queryTalentId)
      .maybeSingle()

    if (talentError) {
      console.error('Failed to resolve talent to user', talentError)
      return NextResponse.json(
        { error: 'Failed to resolve talent' },
        { status: 500 }
      )
    }

    resolvedUserId = talentRow?.user_id ?? queryTalentId
  }

  if (!resolvedUserId) {
    return NextResponse.json({ error: 'Invalid query parameters' }, { status: 400 })
  }

  if (resolvedUserId !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const userId = resolvedUserId

  type AvailabilitySettingsRow = {
    default_mode: string | null
    timezone: string | null
  }

  const supabaseRpc = supabase as any

  const settingsResponse = await supabaseRpc
    .from('talent_availability_settings')
    .select('default_mode, timezone')
    .eq('user_id', userId)
    .maybeSingle()

  const settingsError = settingsResponse.error
  const settingsData = settingsResponse.data as AvailabilitySettingsRow | null

  if (settingsError) {
    console.error('Failed to fetch availability settings', settingsError)
    return NextResponse.json(
      { error: 'Failed to fetch availability settings' },
      { status: 500 }
    )
  }

  type AvailabilityDateRow = {
    the_date: string
    status: string
  }

  const datesResponse = await supabaseRpc
    .from('talent_availability_dates')
    .select('the_date, status')
    .eq('user_id', userId)
    .gte('the_date', from)
    .lte('the_date', to)

  const datesError = datesResponse.error
  const datesData = datesResponse.data as AvailabilityDateRow[] | null

  if (datesError) {
    console.error('Failed to fetch availability dates', datesError)
    return NextResponse.json(
      { error: 'Failed to fetch availability dates' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    settings: {
      default_mode: settingsData?.default_mode ?? 'default_ok',
      timezone: settingsData?.timezone ?? 'Asia/Tokyo',
    },
    dates: (datesData ?? []).map((row) => ({
      date: row.the_date,
      status: row.status,
    })),
  })
}
