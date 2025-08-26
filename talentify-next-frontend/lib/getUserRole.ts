import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

export type UserRole = 'store' | 'talent' | 'company'

export async function getUserRoleInfo(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<{ role: UserRole | null; name: string | null; isSetupComplete: boolean | null }> {
  // user_metadata に role が設定されている場合はそれを優先
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const metaRole = (user?.user_metadata as any)?.role as UserRole | undefined

  const fetchRole = (
    table: 'talents' | 'stores' | 'companies',
    nameField: string,
  ) =>
    supabase
      .from(table as any)
      .select(`${nameField}, is_setup_complete`)
      .eq('user_id', userId)
      .maybeSingle()

  if (metaRole) {
    const table =
      metaRole === 'talent'
        ? 'talents'
        : metaRole === 'store'
        ? 'stores'
        : 'companies'
    const nameField =
      metaRole === 'talent'
        ? 'stage_name'
        : metaRole === 'store'
        ? 'store_name'
        : 'display_name'
    const { data } = await fetchRole(table, nameField)
    return {
      role: metaRole,
      name:
        metaRole === 'talent'
          ? (data as any)?.stage_name ?? null
          : metaRole === 'store'
          ? (data as any)?.store_name ?? '店舗ユーザー'
          : (data as any)?.display_name ?? '会社ユーザー',
      isSetupComplete: (data as any)?.is_setup_complete ?? false,
    }
  }

  // メタデータがない場合はテーブルを優先順位順に検索 (talent > store > company)
  const [
    { data: talent },
    { data: store },
    { data: company },
  ] = await Promise.all([
    fetchRole('talents', 'stage_name'),
    fetchRole('stores', 'store_name'),
    fetchRole('companies', 'display_name'),
  ])

  if (talent) {
    return {
      role: 'talent',
      name: (talent as any).stage_name ?? null,
      isSetupComplete: (talent as any).is_setup_complete ?? false,
    }
  }

  if (store) {
    return {
      role: 'store',
      name: (store as any).store_name ?? '店舗ユーザー',
      isSetupComplete: (store as any).is_setup_complete ?? false,
    }
  }

  if (company) {
    return {
      role: 'company',
      name: (company as any).display_name ?? '会社ユーザー',
      isSetupComplete: (company as any).is_setup_complete ?? false,
    }
  }

  return { role: null, name: null, isSetupComplete: null }
}

