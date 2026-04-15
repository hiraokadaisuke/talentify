import { createServiceClient } from '@/lib/supabase/service'
import type { SignupRole } from '@/lib/auth/signup'

export type AppUserStatus =
  | 'pending_email_verification'
  | 'onboarding'
  | 'active'
  | 'suspended'

type UpsertAppUserParams = {
  authUserId: string
  email: string
  role: SignupRole
  status: AppUserStatus
}

export async function upsertAppUser(params: UpsertAppUserParams) {
  const service = createServiceClient()

  const record = {
    auth_user_id: params.authUserId,
    email: params.email,
    role: params.role,
    status: params.status,
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

  if (existing?.id) {
    const { error: updateError } = await service
      .from('users' as any)
      .update(record)
      .eq('id', existing.id)

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
