import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/supabase'
import { NextRequest } from 'next/server'
import { z } from 'zod'

const querySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})

type TalentRow = Pick<
  Database['public']['Tables']['talents']['Row'],
  | 'id'
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

export async function GET(request: NextRequest) {
  const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries())
  const parsed = querySchema.safeParse(searchParams)

  if (!parsed.success) {
    return new Response(JSON.stringify({ error: 'Invalid or missing date parameter' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const supabase = await createClient()
  const { date } = parsed.data

  const { data: availabilityRows, error: availabilityError } = await supabase.rpc(
    'get_available_talents',
    { _date: date }
  )

  if (availabilityError) {
    console.error('Failed to resolve available talents', availabilityError)
    return new Response(JSON.stringify({ error: 'Failed to load talents' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const talentIds = (availabilityRows ?? []).map((row) => row.talent_id)

  if (talentIds.length === 0) {
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { data: talents, error: talentsError } = await supabase
    .from('talents')
    .select(
      'id, stage_name, display_name, genre, area, avatar_url, rate, rating, bio, achievements, media_appearance'
    )
    .eq('is_profile_complete', true)
    .in('id', talentIds)

  if (talentsError) {
    console.error('Failed to load talents by date', talentsError)
    return new Response(JSON.stringify({ error: 'Failed to load talents' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const results: TalentSearchResult[] = ((talents ?? []) as TalentRow[]).map((talent) => ({
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
  }))

  return new Response(JSON.stringify(results), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
