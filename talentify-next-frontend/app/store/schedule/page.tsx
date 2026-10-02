import StoreScheduleClient, { type StoreScheduleOfferRow } from './StoreScheduleClient'
import { createClient } from '@/lib/supabase/server'
import { getProtectedRequestUserId } from '@/lib/auth/getProtectedRequestUserId'
import { type OfferStatusDb, toDbOfferStatus } from '@/app/lib/offerStatus'

type PageProps = {
  searchParams?: {
    includeCompleted?: string | string[]
  }
}

function first(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value
}

async function loadStoreSchedule(includeCompleted: boolean): Promise<{
  storeId: string | null
  offerRows: StoreScheduleOfferRow[]
  identityError: boolean
  loadError: boolean
  profileMissing: boolean
}> {
  const supabase = createClient()

  try {
    const { userId } = await getProtectedRequestUserId(supabase)
    if (!userId) {
      return {
        storeId: null,
        offerRows: [],
        identityError: false,
        loadError: false,
        profileMissing: false,
      }
    }

    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle()

    if (storeError) throw storeError
    if (!store) {
      return {
        storeId: null,
        offerRows: [],
        identityError: false,
        loadError: false,
        profileMissing: true,
      }
    }

    const statusesQuery = ['confirmed', 'canceled', 'no_show']
    if (includeCompleted) statusesQuery.push('completed')
    const normalizedStatuses = statusesQuery
      .map(status => toDbOfferStatus(status))
      .filter((status): status is OfferStatusDb => Boolean(status))

    const { data, error } = await supabase
      .from('offers')
      .select(
        'id, talent_id, date, status, start_time, end_time, notes, talents(stage_name)'
      )
      .eq('store_id', store.id)
      .in('status', normalizedStatuses)

    if (error) throw error

    return {
      storeId: store.id,
      offerRows: (data ?? []) as unknown as StoreScheduleOfferRow[],
      identityError: false,
      loadError: false,
      profileMissing: false,
    }
  } catch (error) {
    console.error('failed to preload store schedule', error)
    return {
      storeId: null,
      offerRows: [],
      identityError: false,
      loadError: true,
      profileMissing: false,
    }
  }
}

export default async function StoreSchedulePage({ searchParams }: PageProps) {
  const includeCompleted = first(searchParams?.includeCompleted) !== 'false'
  const { storeId, offerRows, identityError, loadError, profileMissing } =
    await loadStoreSchedule(includeCompleted)

  return (
    <StoreScheduleClient
      initialStoreId={storeId}
      initialOfferRows={offerRows}
      initialIdentityError={identityError}
      initialLoadError={loadError}
      initialProfileMissing={profileMissing}
    />
  )
}
