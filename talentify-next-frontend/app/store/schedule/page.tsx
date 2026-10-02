import StoreScheduleClient from './StoreScheduleClient'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUserWithClient } from '@/lib/auth/getCurrentUserWithClient'

async function loadStoreIdentity(): Promise<{
  storeId: string | null
  identityError: boolean
}> {
  const supabase = createClient()

  try {
    const { user } = await getCurrentUserWithClient(supabase)
    if (!user) {
      return { storeId: null, identityError: false }
    }

    const { data: store, error } = await supabase
      .from('stores')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (error) throw error

    return {
      storeId: store?.id ?? null,
      identityError: false,
    }
  } catch (error) {
    console.error('failed to preload store schedule identity', error)
    return { storeId: null, identityError: true }
  }
}

export default async function StoreSchedulePage() {
  const { storeId, identityError } = await loadStoreIdentity()

  return (
    <StoreScheduleClient
      initialStoreId={storeId}
      initialIdentityError={identityError}
    />
  )
}
