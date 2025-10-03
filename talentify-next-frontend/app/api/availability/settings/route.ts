import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'

import { createClient } from '@/lib/supabase/server'

const DEFAULT_TIMEZONE = 'Asia/Tokyo'

const payloadSchema = z.object({
  default_mode: z.enum(['default_ok', 'default_ng']),
  timezone: z.string().min(1).optional(),
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
    .select('default_mode, timezone')
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
    default_mode: settings?.default_mode ?? 'default_ok',
    timezone: settings?.timezone ?? DEFAULT_TIMEZONE,
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

  const timezone = parsed.data.timezone ?? DEFAULT_TIMEZONE

  const { error: upsertError } = await supabase
    .from('talent_availability_settings')
    .upsert({
      talent_id: talent.id,
      default_mode: parsed.data.default_mode,
      timezone,
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
