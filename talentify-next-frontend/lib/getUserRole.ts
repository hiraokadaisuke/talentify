import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

export type UserRole = 'store' | 'talent'
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
  return value === 'store' || value === 'talent'
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

  if (role === 'store') {
    const { data } = await supabase
      .from('stores')
      .select('store_name, is_setup_complete')
      .eq('user_id', userId)
      .maybeSingle()

    return {
      role,
      name: data?.store_name ?? '店舗ユーザー',
      isSetupComplete: Boolean(data?.is_setup_complete),
      status,
    }
  }

  if (role === 'talent') {
    const { data } = await supabase
      .from('talents')
      .select('stage_name, is_setup_complete')
      .eq('user_id', userId)
      .maybeSingle()

    return {
      role,
      name: data?.stage_name ?? null,
      isSetupComplete: Boolean(data?.is_setup_complete),
      status,
    }
  }

  const [{ data: talent }, { data: store }] = await Promise.all([
    supabase.from('talents').select('stage_name, is_setup_complete').eq('user_id', userId).maybeSingle(),
    supabase.from('stores').select('store_name, is_setup_complete').eq('user_id', userId).maybeSingle(),
  ])

  if (talent) {
    return {
      role: 'talent',
      name: talent.stage_name ?? null,
      isSetupComplete: Boolean(talent.is_setup_complete),
      status,
    }
  }

  if (store) {
    return {
      role: 'store',
      name: store.store_name ?? '店舗ユーザー',
      isSetupComplete: Boolean(store.is_setup_complete),
      status,
    }
  }

  return { role: null, name: null, isSetupComplete: null, status }
}
