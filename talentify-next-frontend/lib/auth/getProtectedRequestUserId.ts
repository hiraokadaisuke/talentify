import { headers } from 'next/headers'
import type { AuthError, SupabaseClient } from '@supabase/supabase-js'
import { getCurrentUserWithClient } from '@/lib/auth/getCurrentUserWithClient'

type AuthClient = Pick<SupabaseClient, 'auth'>

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export type ProtectedRequestUserIdResult = {
  userId: string | null
  error: AuthError | null
  source: 'middleware' | 'auth'
}

export async function getProtectedRequestUserId(
  client: AuthClient,
): Promise<ProtectedRequestUserIdResult> {
  const middlewareUserId = headers().get('x-raiten-user-id')

  if (middlewareUserId && UUID_PATTERN.test(middlewareUserId)) {
    return {
      userId: middlewareUserId,
      error: null,
      source: 'middleware',
    }
  }

  const { user, error } = await getCurrentUserWithClient(client)
  return {
    userId: user?.id ?? null,
    error,
    source: 'auth',
  }
}
