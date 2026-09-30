import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAppUserByAuthUserId, upsertAppUser } from '@/lib/auth/app-user'
import { SIGNUP_ROLES, type SignupRole } from '@/lib/auth/signup'
import { ensureStoreProfile, ensureTalentProfile } from '@/lib/provision'
import { createServiceClient } from '@/lib/supabase/service'

function toSignupRole(value: string | null | undefined): SignupRole | undefined {
  if (!value) return undefined
  return SIGNUP_ROLES.includes(value as SignupRole)
    ? (value as SignupRole)
    : undefined
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const roleFromQuery = toSignupRole(url.searchParams.get('role'))

  if (!code) {
    return NextResponse.redirect(new URL('/auth/error', url))
  }

  const supabase = createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) {
    console.error('auth code exchange failed', error)
    return NextResponse.redirect(new URL('/auth/error', url))
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user?.id || !user.email) {
    return NextResponse.redirect(new URL('/auth/error', url))
  }

  try {
    const existing = await getAppUserByAuthUserId(user.id)
    const existingRole = toSignupRole(existing?.role)
    const role = existingRole ?? roleFromQuery

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
      if (syncedUser?.phone) {
        await service
          .from('talents')
          .update({ phone: syncedUser.phone })
          .eq('user_id', user.id)
          .is('phone', null)
      }
    }

    const target =
      role === 'store'
        ? '/store/dashboard'
        : role === 'talent'
          ? '/talent/dashboard'
          : '/account/role'

    return NextResponse.redirect(new URL(target, url))
  } catch (appUserError) {
    console.error('failed to sync app user on callback', appUserError)
    return NextResponse.redirect(new URL('/auth/error', url))
  }
}
