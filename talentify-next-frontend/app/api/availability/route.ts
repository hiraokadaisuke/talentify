import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'

import { createClient } from '@/lib/supabase/server'

const DATE_ERROR_MESSAGE = 'value must be a valid ISO date'

const querySchema = z
  .object({
    user_id: z.string().uuid('user_id must be a valid UUID').optional(),
    talent_id: z.string().uuid('talent_id must be a valid UUID').optional(),
    from: z
      .string()
      .refine((value) => !Number.isNaN(Date.parse(value)), DATE_ERROR_MESSAGE),
    to: z
      .string()
      .refine((value) => !Number.isNaN(Date.parse(value)), DATE_ERROR_MESSAGE),
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

  let resolvedTalentId: string | null = null

  if (queryTalentId) {
    const { data: talentRow, error: talentError } = await supabase
      .from('talents')
      .select('id, user_id')
      .eq('id', queryTalentId)
      .maybeSingle()

    if (talentError) {
      console.error('Failed to resolve requested talent', talentError)
      return NextResponse.json(
        { error: 'Failed to resolve talent' },
        { status: 500 }
      )
    }

    if (!talentRow) {
      return NextResponse.json({ error: 'Talent not found' }, { status: 404 })
    }

    if (talentRow.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    resolvedTalentId = talentRow.id
  } else if (queryUserId) {
    if (queryUserId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data: talentRow, error: talentError } = await supabase
      .from('talents')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (talentError) {
      console.error('Failed to resolve user talent', talentError)
      return NextResponse.json(
        { error: 'Failed to resolve talent' },
        { status: 500 }
      )
    }

    if (!talentRow) {
      return NextResponse.json(
        { error: 'Talent profile not found' },
        { status: 404 }
      )
    }

    resolvedTalentId = talentRow.id
  }

  if (!resolvedTalentId) {
    return NextResponse.json({ error: 'Invalid query parameters' }, { status: 400 })
  }

  type SettingsRow = {
    default_mode: 'ok' | 'ng' | null
    timezone: string | null
    week_pattern: Record<string, 'ok' | 'ng'> | null
  }

  const { data: settingsRow, error: settingsError } = await supabase
    .from('talent_availability_settings')
    .select('default_mode, timezone, week_pattern')
    .eq('talent_id', resolvedTalentId)
    .maybeSingle<SettingsRow>()

  if (settingsError) {
    console.error('Failed to fetch availability settings', settingsError)
    return NextResponse.json(
      { error: 'Failed to fetch availability settings' },
      { status: 500 }
    )
  }

  const { data: overrideRows, error: overridesError } = await supabase
    .from('talent_availability_overrides')
    .select('date, status')
    .eq('talent_id', resolvedTalentId)
    .gte('date', from)
    .lte('date', to)
    .order('date', { ascending: true })

  if (overridesError) {
    console.error('Failed to fetch availability overrides', overridesError)
    return NextResponse.json(
      { error: 'Failed to fetch availability overrides' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    settings: {
      default_mode: settingsRow?.default_mode ?? 'ok',
      timezone: settingsRow?.timezone ?? 'Asia/Tokyo',
      week_pattern: settingsRow?.week_pattern ?? null,
    },
    dates: (overrideRows ?? []).map((row) => ({
      date: row.date,
      status: row.status,
    })),
  })
}
