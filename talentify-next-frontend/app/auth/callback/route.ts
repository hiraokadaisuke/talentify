import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { upsertAppUser } from '@/lib/auth/app-user'
import { SIGNUP_ROLES, type SignupRole } from '@/lib/auth/signup'

function toSignupRole(value: string | undefined): SignupRole | undefined {
  if (!value) {
    return undefined
  }

  return SIGNUP_ROLES.includes(value as SignupRole)
    ? (value as SignupRole)
    : undefined
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const roleParam = url.searchParams.get('role') ?? undefined

  if (!code) {
    return NextResponse.redirect(new URL('/auth/error', url))
  }

  const supabase = createClient()

  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) {
    console.error('exchange error:', error)
    return NextResponse.redirect(new URL('/auth/error', url))
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const roleFromMetadata = toSignupRole((user?.user_metadata as { role?: string } | undefined)?.role)
  const role = toSignupRole(roleParam) ?? roleFromMetadata

  if (user?.id && user?.email && role) {
    try {
      await upsertAppUser({
        authUserId: user.id,
        email: user.email,
        role,
        status: 'onboarding',
      })
    } catch (appUserError) {
      console.error('failed to upsert app user on callback', appUserError)
    }
  }

  const redirect =
    role === 'store'
      ? '/store/edit'
      : role === 'talent'
      ? '/talent/edit'
      : role === 'company'
      ? '/company/edit'
      : '/dashboard'

  return NextResponse.redirect(new URL(redirect, url))
}
