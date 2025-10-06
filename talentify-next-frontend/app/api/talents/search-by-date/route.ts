import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/supabase'
import { NextRequest } from 'next/server'
import { z } from 'zod'
import type { PostgrestError } from '@supabase/supabase-js'
import { toDbOfferStatus } from '@/app/lib/offerStatus'

const querySchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/),
})

export type TalentRow =
  Pick<
    Database['public']['Tables']['talents']['Row'],
    | 'id'
    | 'stage_name'
    | 'genre'
    | 'area'
    | 'avatar_url'
    | 'rate'
    | 'bio'
    | 'media_appearance'
  > & {
    rating?: number | null
  }

export type AvailabilitySettingRow = Pick<
  Database['public']['Tables']['talent_availability_settings']['Row'],
  'talent_id' | 'default_mode'
>

export type AvailabilityDateRow = Pick<
  Database['public']['Tables']['talent_availability_dates']['Row'],
  'talent_id' | 'status'
>

type OfferRow = Pick<
  Database['public']['Tables']['offers']['Row'],
  'talent_id'
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
  availability_status: 'ok' | 'ng'
}

export function computeAvailabilityStatus({
  defaultMode,
  overrideStatus,
  hasConfirmedOffer,
}: {
  defaultMode: AvailabilitySettingRow['default_mode']
  overrideStatus?: AvailabilityDateRow['status']
  hasConfirmedOffer: boolean
}): 'ok' | 'ng' {
  if (hasConfirmedOffer) {
    return 'ng'
  }

  if (overrideStatus) {
    return overrideStatus
  }

  return defaultMode === 'default_ok' ? 'ok' : 'ng'
}

export function mergeTalentAvailability({
  talents,
  availabilitySettings,
  availabilityDates,
  confirmedTalentIds,
}: {
  talents: TalentRow[]
  availabilitySettings: AvailabilitySettingRow[]
  availabilityDates: AvailabilityDateRow[]
  confirmedTalentIds: Set<string>
}): TalentSearchResult[] {
  const settingsMap = new Map<string, AvailabilitySettingRow['default_mode']>()
  availabilitySettings.forEach(setting => {
    settingsMap.set(setting.talent_id, setting.default_mode)
  })

  const overridesMap = new Map<string, AvailabilityDateRow['status']>()
  availabilityDates.forEach(override => {
    overridesMap.set(override.talent_id, override.status)
  })

  return talents
    .map<TalentSearchResult>(talent => {
      const defaultMode = settingsMap.get(talent.id) ?? 'default_ok'
      const overrideStatus = overridesMap.get(talent.id)
      const hasConfirmedOffer = confirmedTalentIds.has(talent.id)

      const availabilityStatus = computeAvailabilityStatus({
        defaultMode,
        overrideStatus,
        hasConfirmedOffer,
      })

      return {
        id: talent.id,
        stage_name: talent.stage_name,
        display_name: talent.stage_name ?? null,
        genre: talent.genre,
        area: talent.area,
        avatar_url: talent.avatar_url,
        rate: talent.rate,
        rating: talent.rating ?? null,
        bio: talent.bio,
        achievements: talent.media_appearance ?? null,
        availability_status: availabilityStatus,
      }
    })
    .filter(talent => talent.availability_status === 'ok')
}

type QueryResult<T> = {
  data: T | null
  error: PostgrestError | null
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

  const confirmedStatus = toDbOfferStatus('confirmed') ?? 'confirmed'

  const [talentsRes, settingsRes, datesRes, offersRes] = (await Promise.all([
    supabase
      .from('talents')
      .select(
        'id, stage_name, genre, area, avatar_url, rate, bio, media_appearance'
      )
      .eq('is_profile_complete', true),
    supabase.from('talent_availability_settings').select('talent_id, default_mode'),
    supabase
      .from('talent_availability_dates')
      .select('talent_id, status')
      .eq('the_date', date),
    supabase
      .from('offers')
      .select('talent_id')
      .eq('status', confirmedStatus)
      .eq('date', date),
  ])) as [
    QueryResult<TalentRow[]>,
    QueryResult<AvailabilitySettingRow[]>,
    QueryResult<AvailabilityDateRow[]>,
    QueryResult<OfferRow[]>,
  ]

  const { data: talents, error: talentsError } = talentsRes
  const { data: availabilitySettings, error: settingsError } = settingsRes
  const { data: availabilityDates, error: datesError } = datesRes
  const { data: confirmedOffers, error: offersError } = offersRes

  if (talentsError || settingsError || datesError || offersError) {
    console.error('Failed to load talents by date', {
      talentsError,
      settingsError,
      datesError,
      offersError,
    })
    return new Response(JSON.stringify({ error: 'Failed to load talents' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const confirmedTalentIds = new Set<string>()
  confirmedOffers?.forEach(offer => {
    if (offer.talent_id) {
      confirmedTalentIds.add(offer.talent_id)
    }
  })

  const results = mergeTalentAvailability({
    talents: talents ?? [],
    availabilitySettings: availabilitySettings ?? [],
    availabilityDates: availabilityDates ?? [],
    confirmedTalentIds,
  })

  return new Response(JSON.stringify(results), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
