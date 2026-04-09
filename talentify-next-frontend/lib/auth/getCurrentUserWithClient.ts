import type { AuthError, SupabaseClient, User } from '@supabase/supabase-js'

type AuthClient = Pick<SupabaseClient, 'auth'>

export type CurrentUserResult = {
  user: User | null
  error: AuthError | null
}

export async function getCurrentUserWithClient(client: AuthClient): Promise<CurrentUserResult> {
  const {
    data: { user },
    error,
  } = await client.auth.getUser()

  return {
    user,
    error,
  }
}
