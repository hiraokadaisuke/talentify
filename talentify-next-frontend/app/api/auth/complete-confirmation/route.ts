import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { getAppUserByAuthUserId, upsertAppUser } from '@/lib/auth/app-user'
import { SIGNUP_ROLES, type SignupRole } from '@/lib/auth/signup'
import { ensureStoreProfile, ensureTalentProfile } from '@/lib/provision'

export const runtime = 'nodejs'

function toSignupRole(value: string | null | undefined): SignupRole | undefined {
  if (!value) return undefined
  return SIGNUP_ROLES.includes(value as SignupRole)
    ? (value as SignupRole)
    : undefined
}

export async function POST() {
  const supabase = createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user?.id || !user.email) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  try {
    const existing = await getAppUserByAuthUserId(user.id)
    const role = toSignupRole(existing?.role)

    await upsertAppUser({
      authUserId: user.id,
      email: user.email,
      role,
      status: 'onboarding',
    })

    const syncedUser = await getAppUserByAuthUserId(user.id)
    const service = createServiceClient()

    if (role === 'store') {
      await ensureStoreProfile(supabase, user.id)

      if (syncedUser?.phone) {
        await service
          .from('stores')
          .update({ contact_phone: syncedUser.phone })
          .eq('user_id', user.id)
          .is('contact_phone', null)
      }
    } else if (role === 'talent') {
      await ensureTalentProfile(supabase, user.id)
    }

    const target =
      role === 'store'
        ? '/store/dashboard'
        : role === 'talent'
          ? '/talent/dashboard'
          : '/account/role'

    return NextResponse.json({ ok: true, target })
  } catch (error) {
    console.error('failed to complete signup confirmation', error)
    return NextResponse.json({ error: 'confirmation_finalize_failed' }, { status: 500 })
  }
}
