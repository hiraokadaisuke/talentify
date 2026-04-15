import { createServiceClient } from '@/lib/supabase/service'
import { SIGNUP_ROLES, type SignupRole } from '@/lib/auth/signup'
import {
  resolveNextAppUserStatus,
  type AppUserStatus,
} from '@/lib/auth/user-state'

type UpsertAppUserParams = {
  authUserId: string
  email: string
  role?: SignupRole
  status: AppUserStatus
}

type AppUserRow = {
  id?: string
  auth_user_id?: string
  email?: string | null
  role?: string | null
  status?: AppUserStatus | null
} | null

function toSignupRole(value: string | null | undefined): SignupRole | undefined {
  if (!value) {
    return undefined
  }

  return SIGNUP_ROLES.includes(value as SignupRole)
    ? (value as SignupRole)
    : undefined
}

async function findByAuthUserId(authUserId: string): Promise<AppUserRow> {
  const service = createServiceClient()
  const { data, error } = await service
    .from('users' as any)
    .select('id, auth_user_id, email, role, status')
    .eq('auth_user_id', authUserId)
    .maybeSingle()

  if (error && error.code !== 'PGRST116') {
    throw error
  }

  return (data as AppUserRow) ?? null
}

export async function getAppUserByAuthUserId(authUserId: string): Promise<AppUserRow> {
  return findByAuthUserId(authUserId)
}

export async function upsertAppUser(params: UpsertAppUserParams) {
  const service = createServiceClient()
  const existing = await findByAuthUserId(params.authUserId)

  const resolvedRole = params.role ?? toSignupRole(existing?.role)
  const resolvedStatus = resolveNextAppUserStatus(existing?.status, params.status)

  const record = {
    auth_user_id: params.authUserId,
    email: params.email,
    role: resolvedRole ?? existing?.role ?? null,
    status: resolvedStatus,
  }

  const upsertResult = await service
    .from('users' as any)
    .upsert(record, { onConflict: 'auth_user_id' })

  if (!upsertResult.error) {
    return
  }

  const { error } = upsertResult

  if (error.code !== '42P10') {
    throw error
  }

  const { data: existing, error: selectError } = await service
    .from('users' as any)
    .select('id')
    .eq('auth_user_id', params.authUserId)
    .maybeSingle()

  if (selectError && selectError.code !== 'PGRST116') {
    throw selectError
  }

  const existingId = (existing as { id?: string } | null)?.id

  if (existingId) {
    const { error: updateError } = await service
      .from('users' as any)
      .update(record)
      .eq('id', existingId)

    if (updateError) {
      throw updateError
    }

    return
  }

  const { error: insertError } = await service
    .from('users' as any)
    .insert(record)

  if (insertError) {
    throw insertError
  }
}
