import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

export type UserRole = 'store' | 'talent' | 'company'
export type AppUserStatus =
  | 'pending_email_verification'
  | 'onboarding'
  | 'active'
  | 'suspended'

type RoleInfo = {
  role: UserRole | null
  name: string | null
  isSetupComplete: boolean | null
  status: AppUserStatus | null
}

function isUserRole(value: unknown): value is UserRole {
  return value === 'store' || value === 'talent' || value === 'company'
}

function isAppUserStatus(value: unknown): value is AppUserStatus {
  return (
    value === 'pending_email_verification' ||
    value === 'onboarding' ||
    value === 'active' ||
    value === 'suspended'
  )
}

export async function getUserRoleInfo(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<RoleInfo> {
  const { data: appUser } = await supabase
    .from('users')
    .select('role, status')
    .eq('auth_user_id', userId)
    .maybeSingle()

  const role = isUserRole(appUser?.role) ? appUser.role : null
  const status = isAppUserStatus(appUser?.status) ? appUser.status : null

  const fetchProfile = (
    table: 'talents' | 'stores' | 'companies',
    nameField: 'stage_name' | 'store_name' | 'display_name',
  ) =>
    supabase
      .from(table as any)
      .select(`${nameField}, is_setup_complete`)
      .eq('user_id', userId)
      .maybeSingle()

  if (role) {
    const table =
      role === 'talent' ? 'talents' : role === 'store' ? 'stores' : 'companies'
    const nameField =
      role === 'talent'
        ? 'stage_name'
        : role === 'store'
          ? 'store_name'
          : 'display_name'

    const { data } = await fetchProfile(table, nameField)
    const profile = data as Record<string, unknown> | null

    return {
      role,
      name:
        role === 'talent'
          ? (profile?.stage_name as string | null | undefined) ?? null
          : role === 'store'
            ? (profile?.store_name as string | null | undefined) ?? '店舗ユーザー'
            : (profile?.display_name as string | null | undefined) ?? '会社ユーザー',
      isSetupComplete: Boolean(profile?.is_setup_complete),
      status,
    }
  }

  // Legacy safety net: derive a role only from server-controlled profile rows.
  const [{ data: talent }, { data: store }, { data: company }] = await Promise.all([
    fetchProfile('talents', 'stage_name'),
    fetchProfile('stores', 'store_name'),
    fetchProfile('companies', 'display_name'),
  ])

  if (talent) {
    return {
      role: 'talent',
      name: (talent as any).stage_name ?? null,
      isSetupComplete: Boolean((talent as any).is_setup_complete),
      status,
    }
  }
  if (store) {
    return {
      role: 'store',
      name: (store as any).store_name ?? '店舗ユーザー',
      isSetupComplete: Boolean((store as any).is_setup_complete),
      status,
    }
  }
  if (company) {
    return {
      role: 'company',
      name: (company as any).display_name ?? '会社ユーザー',
      isSetupComplete: Boolean((company as any).is_setup_complete),
      status,
    }
  }

  return { role: null, name: null, isSetupComplete: null, status }
}
