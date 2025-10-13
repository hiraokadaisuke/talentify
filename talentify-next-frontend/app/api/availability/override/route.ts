import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'

import { createClient } from '@/lib/supabase/server'

const payloadSchema = z.object({
  dates: z
    .array(
      z.object({
        date: z
          .string()
          .refine((value) => !Number.isNaN(Date.parse(value)), 'date must be ISO'),
        status: z.enum(['ok', 'ng', 'default']),
      })
    )
    .min(1),
})

const DEFAULT_TIMEZONE = 'Asia/Tokyo'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const parsed = payloadSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid payload', details: parsed.error.flatten() },
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

  const { data: talent, error: talentError } = await supabase
    .from('talents')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (talentError) {
    console.error('Failed to fetch talent for override update', talentError)
    return NextResponse.json(
      { error: 'Failed to fetch talent for override update' },
      { status: 500 }
    )
  }

  if (!talent) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const talentId = talent.id
  const deduped = new Map<string, 'ok' | 'ng' | 'default'>()

  for (const item of parsed.data.dates) {
    deduped.set(item.date, item.status)
  }

  const toUpsert: { talent_id: string; date: string; status: 'ok' | 'ng' }[] = []
  const toDelete: string[] = []

  for (const [date, status] of deduped.entries()) {
    if (status === 'default') {
      toDelete.push(date)
    } else {
      toUpsert.push({ talent_id: talentId, date, status })
    }
  }

  const { data: existingSettings, error: existingSettingsError } = await supabase
    .from('talent_availability_settings')
    .select('talent_id')
    .eq('talent_id', talentId)
    .maybeSingle()

  if (existingSettingsError) {
    console.error('Failed to check existing availability settings', existingSettingsError)
    return NextResponse.json(
      { error: 'Failed to prepare availability overrides' },
      { status: 500 }
    )
  }

  if (!existingSettings) {
    const { error: initSettingsError } = await supabase
      .from('talent_availability_settings')
      .upsert({
        talent_id: talentId,
        default_mode: 'ok',
        timezone: DEFAULT_TIMEZONE,
      })

    if (initSettingsError) {
      console.error('Failed to initialize availability settings before override', initSettingsError)
      return NextResponse.json(
        { error: 'Failed to prepare availability overrides' },
        { status: 500 }
      )
    }
  }

  if (toUpsert.length > 0) {
    const { error: upsertError } = await supabase
      .from('talent_availability_overrides')
      .upsert(toUpsert, { onConflict: 'talent_id,date' })

    if (upsertError) {
      console.error('Failed to upsert availability overrides', upsertError)
      return NextResponse.json(
        { error: 'Failed to upsert availability overrides' },
        { status: 500 }
      )
    }
  }

  if (toDelete.length > 0) {
    const { error: deleteError } = await supabase
      .from('talent_availability_overrides')
      .delete()
      .eq('talent_id', talentId)
      .in('date', toDelete)

    if (deleteError) {
      console.error('Failed to delete availability overrides', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete availability overrides' },
        { status: 500 }
      )
    }
  }

  return NextResponse.json({ success: true })
}
