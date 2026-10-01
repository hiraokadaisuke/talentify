import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function getAdminContext() {
  const supabase = createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { user: null, isAdmin: false }
  }

  const service = createServiceClient() as any
  const { data, error } = await service
    .from('admin_users')
    .select('auth_user_id,is_active')
    .eq('auth_user_id', user.id)
    .eq('is_active', true)
    .maybeSingle()

  if (error) {
    console.error('[admin] failed to verify admin membership', error)
    throw error
  }

  return {
    user,
    isAdmin: Boolean(data?.is_active),
  }
}

export async function writeAdminAudit({
  adminAuthUserId,
  action,
  targetType,
  targetId,
  metadata = {},
}: {
  adminAuthUserId: string
  action: string
  targetType?: string | null
  targetId?: string | null
  metadata?: Record<string, unknown>
}) {
  const service = createServiceClient() as any
  const { error } = await service.from('admin_audit_log').insert({
    admin_auth_user_id: adminAuthUserId,
    action,
    target_type: targetType ?? null,
    target_id: targetId ?? null,
    metadata,
  })

  if (error) {
    console.error('[admin] failed to write audit log', error)
  }
}
