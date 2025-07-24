import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

export type UserRole = 'store' | 'talent' | 'company'

export async function getUserRoleInfo(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<{ role: UserRole | null; name: string | null }> {
  const { data: store } = await supabase
    .from('stores' as any)
    .select('display_name')
    .eq('user_id', userId)
    .maybeSingle()
  if (store) {
    return { role: 'store', name: (store as any).display_name ?? '店舗ユーザー' }
  }

  const { data: talent } = await supabase
    .from('talents' as any)
    .select('stage_name')
    .eq('user_id', userId)
    .maybeSingle()
  if (talent) {
    return { role: 'talent', name: (talent as any).stage_name ?? 'タレント' }
  }

  const { data: company } = await supabase
    .from('companies' as any)
    .select('display_name')
    .eq('user_id', userId)
    .maybeSingle()
  if (company) {
    return { role: 'company', name: (company as any).display_name ?? '会社ユーザー' }
  }

  return { role: null, name: null }
}
