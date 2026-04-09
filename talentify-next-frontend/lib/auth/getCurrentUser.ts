import type { AuthError, User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'

export type CurrentUserResult = {
  user: User | null
  error: AuthError | null
}

export async function getCurrentUser(): Promise<CurrentUserResult> {
  const supabase = createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  return {
    user,
    error,
  }
}
