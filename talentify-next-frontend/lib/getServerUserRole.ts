import { createClient } from '@/lib/supabase/server'
import { getUserRoleInfo } from '@/lib/getUserRole'

export async function getServerUserRole() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { role: null, isSetupComplete: null }
  }
  const { role, isSetupComplete } = await getUserRoleInfo(supabase, user.id)
  return { role, isSetupComplete }
}
