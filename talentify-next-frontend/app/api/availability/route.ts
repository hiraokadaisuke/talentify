import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'

import { createClient } from '@/lib/supabase/server'

const querySchema = z.object({
  talent_id: z.string().uuid('talent_id must be a valid UUID'),
  from: z
    .string()
    .refine((value) => !Number.isNaN(Date.parse(value)), 'from must be a date'),
  to: z
    .string()
    .refine((value) => !Number.isNaN(Date.parse(value)), 'to must be a date'),
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

  const {
    data: { user },
  } = await createClient().auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { talent_id: talentId, from, to } = parsed.data

  const supabase = createClient()

  const { data: talent, error: talentError } = await supabase
    .from('talents')
    .select('id')
    .eq('id', talentId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (talentError) {
    console.error('Failed to verify talent ownership', talentError)
    return NextResponse.json(
      { error: 'Failed to verify talent ownership' },
      { status: 500 }
    )
  }

  if (!talent) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data: settingsData, error: settingsError } = await supabase
    .from('talent_availability_settings')
    .select('default_mode, timezone')
    .eq('talent_id', talentId)
    .maybeSingle()

  if (settingsError) {
    console.error('Failed to fetch availability settings', settingsError)
    return NextResponse.json(
      { error: 'Failed to fetch availability settings' },
      { status: 500 }
    )
  }

  const { data: datesData, error: datesError } = await supabase
    .from('talent_availability_dates')
    .select('the_date, status')
    .eq('talent_id', talentId)
    .gte('the_date', from)
    .lte('the_date', to)

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
