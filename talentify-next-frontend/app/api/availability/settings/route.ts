import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'

import { createClient } from '@/lib/supabase/server'

const DEFAULT_TIMEZONE = 'Asia/Tokyo'
const dayStatusSchema = z.enum(['ok', 'ng'])

const weekPatternSchema = z.record(z.enum(['0', '1', '2', '3', '4', '5', '6']), dayStatusSchema)

const payloadSchema = z
  .object({
    default_mode: dayStatusSchema.optional(),
    timezone: z.string().min(1).optional(),
    week_pattern: z.union([weekPatternSchema, z.null()]).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field is required',
    path: ['default_mode'],
  })

export async function GET() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: talent, error: talentError } = await supabase
    .from('talents')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (talentError) {
    console.error('Failed to fetch talent for availability settings', talentError)
    return NextResponse.json(
      { error: 'Failed to fetch talent for availability settings' },
      { status: 500 }
    )
  }

  if (!talent) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data: settings, error: settingsError } = await supabase
    .from('talent_availability_settings')
    .select('default_mode, timezone, week_pattern')
    .eq('talent_id', talent.id)
    .maybeSingle()

  if (settingsError) {
    console.error('Failed to fetch availability settings', settingsError)
    return NextResponse.json(
      { error: 'Failed to fetch availability settings' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    default_mode: settings?.default_mode ?? 'ok',
    timezone: settings?.timezone ?? DEFAULT_TIMEZONE,
    week_pattern: settings?.week_pattern ?? null,
  })
}

export async function POST(request: NextRequest) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const json = await request.json().catch(() => null)
  const parsed = payloadSchema.safeParse(json)

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid payload', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { data: talent, error: talentError } = await supabase
    .from('talents')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (talentError) {
    console.error('Failed to fetch talent for availability settings update', talentError)
    return NextResponse.json(
      { error: 'Failed to fetch talent for availability settings update' },
      { status: 500 }
    )
  }

  if (!talent) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data: existingSettings, error: existingError } = await supabase
    .from('talent_availability_settings')
    .select('default_mode, timezone, week_pattern')
    .eq('talent_id', talent.id)
    .maybeSingle()

  if (existingError) {
    console.error('Failed to load current availability settings', existingError)
    return NextResponse.json(
      { error: 'Failed to load current availability settings' },
      { status: 500 }
    )
  }

  const hasWeekPatternField = Object.prototype.hasOwnProperty.call(
    parsed.data,
    'week_pattern'
  )

  const nextDefaultMode =
    parsed.data.default_mode ?? existingSettings?.default_mode ?? 'ok'
  const nextTimezone =
    parsed.data.timezone ?? existingSettings?.timezone ?? DEFAULT_TIMEZONE
  const nextWeekPattern = hasWeekPatternField
    ? parsed.data.week_pattern ?? null
    : existingSettings?.week_pattern ?? null

  const { error: upsertError } = await supabase
    .from('talent_availability_settings')
    .upsert({
      talent_id: talent.id,
      default_mode: nextDefaultMode,
      timezone: nextTimezone,
      week_pattern: nextWeekPattern,
    })

  if (upsertError) {
    console.error('Failed to save availability settings', upsertError)
    return NextResponse.json(
      { error: 'Failed to save availability settings' },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}
