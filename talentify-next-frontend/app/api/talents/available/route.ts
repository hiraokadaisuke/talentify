import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'

import { createClient } from '@/lib/supabase/server'

const querySchema = z.object({
  date: z
    .string()
    .refine((value) => !Number.isNaN(Date.parse(value)), 'date must be ISO-8601'),
})

export async function GET(request: NextRequest) {
  const parsed = querySchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams.entries())
  )

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

  const { date } = parsed.data

  const { data: availableRows, error: rpcError } = await supabase.rpc(
    'get_available_talents',
    { _date: date }
  )

  if (rpcError) {
    console.error('Failed to execute get_available_talents RPC', rpcError)
    return NextResponse.json(
      { error: 'Failed to fetch available talents' },
      { status: 500 }
    )
  }

  const talents = Array.isArray(availableRows) ? availableRows : []
  const ids = talents.map((row) => row.talent_id)

  if (ids.length === 0) {
    return NextResponse.json({ date, talents: [] })
  }

  const { data: talentDetails, error: talentError } = await supabase
    .from('talents')
    .select('id, stage_name, name, avatar_url')
    .in('id', ids)

  if (talentError) {
    console.error('Failed to load talent details for availability search', talentError)
    return NextResponse.json(
      { error: 'Failed to load talent details' },
      { status: 500 }
    )
  }

  const detailsMap = new Map(
    (talentDetails ?? []).map((row) => [row.id, row])
  )

  const responseTalents = talents.map((row) => {
    const details = detailsMap.get(row.talent_id) ?? null
    return {
      talent_id: row.talent_id,
      availability: row.availability,
      stage_name: details?.stage_name ?? null,
      name: details?.name ?? null,
      avatar_url: details?.avatar_url ?? null,
    }
  })

  return NextResponse.json({ date, talents: responseTalents })
}
