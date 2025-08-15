import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

export type UserRole = 'store' | 'talent'

export async function getUserRoleInfo(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<{ role: UserRole | null; name: string | null; isSetupComplete: boolean | null }> {
  const [
    { data: store },
    { data: talent },
  ] = await Promise.all([
    supabase
      .from('stores' as any)
      .select('store_name, is_setup_complete')
      .eq('user_id', userId)
      .maybeSingle(),
    supabase
      .from('talents' as any)
      .select('stage_name, is_setup_complete')
      .eq('user_id', userId)
      .maybeSingle(),
  ])

  if (store) {
    return {
      role: 'store',
      name: (store as any).store_name ?? '店舗ユーザー',
      isSetupComplete: (store as any).is_setup_complete ?? false,
    }
  }

  if (talent) {
    return {
      role: 'talent',
      name: (talent as any).stage_name ?? 'タレント',
      isSetupComplete: (talent as any).is_setup_complete ?? false,
    }
  }

  return { role: null, name: null, isSetupComplete: null }
}
