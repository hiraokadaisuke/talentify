import ScheduleCalendar from './ScheduleCalendar'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUserWithClient } from '@/lib/auth/getCurrentUserWithClient'

async function loadScheduleIdentity(): Promise<{
  userId: string | null
  talentId: string | null
  identityError: boolean
}> {
  const supabase = createClient()

  try {
    const { user } = await getCurrentUserWithClient(supabase)
    if (!user) {
      return { userId: null, talentId: null, identityError: false }
    }

    const { data: talent, error } = await supabase
      .from('talents')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (error) throw error

    return {
      userId: user.id,
      talentId: talent?.id ?? null,
      identityError: false,
    }
  } catch (error) {
    console.error('failed to preload talent schedule identity', error)
    return { userId: null, talentId: null, identityError: true }
  }
}

export default async function TalentSchedulePage() {
  const { userId, talentId, identityError } = await loadScheduleIdentity()

  return (
    <ScheduleCalendar
      initialUserId={userId}
      initialTalentId={talentId}
      initialIdentityError={identityError}
    />
  )
}
