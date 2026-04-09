import { createClient } from '@/lib/supabase/server'
import {
  getCurrentUserWithClient,
  type CurrentUserResult,
} from '@/lib/auth/getCurrentUserWithClient'

export type { CurrentUserResult }

export async function getCurrentUser(): Promise<CurrentUserResult> {
  const supabase = createClient()
  return getCurrentUserWithClient(supabase)
}
