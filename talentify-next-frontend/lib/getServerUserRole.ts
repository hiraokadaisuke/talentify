import { createClient } from '@/lib/supabase/server'
import { getUserRoleInfo } from '@/lib/getUserRole'
import { getCurrentUserWithClient } from '@/lib/auth/getCurrentUserWithClient'

export async function getServerUserRole() {
  const supabase = createClient()
  const { user } = await getCurrentUserWithClient(supabase)
  if (!user) {
    return { role: null, isSetupComplete: null }
  }
  const { role, isSetupComplete } = await getUserRoleInfo(supabase, user.id)
  return { role, isSetupComplete }
}
