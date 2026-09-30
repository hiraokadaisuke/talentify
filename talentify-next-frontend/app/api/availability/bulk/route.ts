import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'

import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { createClient } from '@/lib/supabase/server'

const payloadSchema = z.object({
  dates: z
    .array(
      z.object({
        date: z
          .string()
          .refine((value) => !Number.isNaN(Date.parse(value)), 'date must be ISO'),
        status: z.enum(['ok', 'ng']),
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

  const { user } = await getCurrentUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: talent, error: talentError } = await supabase
    .from('talents')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (talentError) {
    console.error('Failed to fetch talent for availability bulk update', talentError)
    return NextResponse.json(
      { error: 'Failed to fetch talent for availability bulk update' },
      { status: 500 }
    )
  }

  if (!talent) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const userId = user.id

  const { data: settingsData, error: settingsError } = await supabase
    .from('talent_availability_settings')
    .select('default_mode')
    .eq('user_id', userId)
    .maybeSingle()

  if (settingsError) {
    console.error('Failed to load talent availability settings', settingsError)
    return NextResponse.json(
      { error: 'Failed to load talent availability settings' },
      { status: 500 }
    )
  }

  const defaultStatus =
    (settingsData?.default_mode ?? 'default_ok') === 'default_ok' ? 'ok' : 'ng'

  const toUpsert: {
    user_id: string
    the_date: string
    status: 'ok' | 'ng'
  }[] = []
  const toDelete: string[] = []

  for (const item of parsed.data.dates) {
    if (item.status === defaultStatus) {
      toDelete.push(item.date)
    } else {
      toUpsert.push({
        user_id: userId,
        the_date: item.date,
        status: item.status,
      })
    }
  }

  if (toUpsert.length > 0) {
    const { error: upsertError } = await supabase
      .from('talent_availability_dates')
      .upsert(toUpsert, { onConflict: 'user_id,the_date' })

    if (upsertError) {
      console.error('Failed to upsert availability dates', upsertError)
      return NextResponse.json(
        { error: 'Failed to upsert availability dates' },
        { status: 500 }
      )
    }
  }

  if (toDelete.length > 0) {
    const { error: deleteError } = await supabase
      .from('talent_availability_dates')
      .delete()
      .eq('user_id', userId)
      .in('the_date', toDelete)

    if (deleteError) {
      console.error('Failed to delete availability dates', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete availability dates' },
        { status: 500 }
      )
    }
  }

  // ensure default settings exist when first updating
  if (!settingsData) {
    const { error: insertSettingsError } = await supabase
      .from('talent_availability_settings')
      .upsert({
        user_id: userId,
        default_mode: 'default_ok',
        timezone: DEFAULT_TIMEZONE,
      })

    if (insertSettingsError) {
      console.error('Failed to initialize availability settings', insertSettingsError)
      return NextResponse.json(
        { error: 'Failed to initialize availability settings' },
        { status: 500 }
      )
    }
  }

  return NextResponse.json({ success: true })
}
