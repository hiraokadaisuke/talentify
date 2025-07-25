import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

export type UserRole = 'store' | 'talent' | 'company'

export async function getUserRoleInfo(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<{ role: UserRole | null; name: string | null; isSetupComplete: boolean | null }> {
  const { data: store } = await supabase
    .from('stores' as any)
    .select('store_name, is_setup_complete')
    .eq('user_id', userId)
    .maybeSingle()
  if (store) {
    return {
      role: 'store',
      name: (store as any).store_name ?? '店舗ユーザー',
      isSetupComplete: (store as any).is_setup_complete ?? false,
    }
  }

  const { data: talent } = await supabase
    .from('talents' as any)
    .select('stage_name, is_setup_complete')
    .eq('id', userId)
    .maybeSingle()
  if (talent) {
    return {
      role: 'talent',
      name: (talent as any).stage_name ?? 'タレント',
      isSetupComplete: (talent as any).is_setup_complete ?? false,
    }
  }

  const { data: company } = await supabase
    .from('companies' as any)
    .select('display_name, is_setup_complete')
    .eq('user_id', userId)
    .maybeSingle()
  if (company) {
    return {
      role: 'company',
      name: (company as any).display_name ?? '会社ユーザー',
      isSetupComplete: (company as any).is_setup_complete ?? false,
    }
  }

  return { role: null, name: null, isSetupComplete: null }
}
