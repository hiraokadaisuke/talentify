import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import {
  mapSupabaseResendError,
  resendConfirmationSchema,
  toSignupRole,
  type ResendConfirmationCode,
} from '@/lib/auth/resend-confirmation'
import { getRedirectUrl } from '@/lib/getRedirectUrl'

type ResendResponse = {
  ok: boolean
  code: ResendConfirmationCode
  message: string
}

function jsonResponse(status: number, body: ResendResponse) {
  return NextResponse.json(body, { status })
}

function resolveEmailRedirect(role?: string) {
  if (role) {
    return getRedirectUrl(role)
  }

  const baseUrl =
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:3000'
      : process.env.NEXT_PUBLIC_SITE_URL || 'https://talentify-xi.vercel.app'

  return `${baseUrl.replace(/\/+$/, '')}/auth/callback`
}

export async function POST(req: NextRequest) {
  let body: unknown

  try {
    body = await req.json()
  } catch {
    return jsonResponse(400, {
      ok: false,
      code: 'INVALID_INPUT',
      message: '入力内容を確認してください',
    })
  }

  const parsed = resendConfirmationSchema.safeParse(body)
  if (!parsed.success) {
    return jsonResponse(400, {
      ok: false,
      code: 'INVALID_INPUT',
      message: '入力内容を確認してください',
    })
  }

  const email = parsed.data.email.toLowerCase()
  const requestedRole = parsed.data.role

  const service = createServiceClient()
  const { data: appUser, error: appUserError } = await service
    .from('users' as any)
    .select('status, role')
    .ilike('email', email)
    .maybeSingle()

  if (appUserError && appUserError.code !== 'PGRST116') {
    console.error('resend confirmation app user lookup failed', appUserError)
    return jsonResponse(500, {
      ok: false,
      code: 'RESEND_FAILED',
      message: '確認メールの再送に失敗しました',
    })
  }

  const appUserRole = toSignupRole(appUser?.role)
  const role = requestedRole ?? appUserRole

  if (requestedRole && appUserRole && requestedRole !== appUserRole) {
    return jsonResponse(200, {
      ok: true,
      code: 'NOT_FOUND_OR_ALREADY_VERIFIED',
      message: '該当する未確認ユーザーが見つからないか、すでに確認済みです',
    })
  }

  if (appUser?.status && appUser.status !== 'pending_email_verification') {
    return jsonResponse(200, {
      ok: true,
      code: 'NOT_FOUND_OR_ALREADY_VERIFIED',
      message: '該当する未確認ユーザーが見つからないか、すでに確認済みです',
    })
  }

  const supabase = createClient()
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: {
      emailRedirectTo: resolveEmailRedirect(role),
    },
  })

  if (error) {
    const code = mapSupabaseResendError(error)

    if (code === 'RATE_LIMITED') {
      return jsonResponse(429, {
        ok: false,
        code,
        message: '送信回数が上限に達しました。時間をおいてお試しください',
      })
    }

    if (code === 'NOT_FOUND_OR_ALREADY_VERIFIED') {
      return jsonResponse(200, {
        ok: true,
        code,
        message: '該当する未確認ユーザーが見つからないか、すでに確認済みです',
      })
    }

    console.error('resend confirmation failed', error)
    return jsonResponse(500, {
      ok: false,
      code,
      message: '確認メールの再送に失敗しました',
    })
  }

  return jsonResponse(200, {
    ok: true,
    code: 'OK',
    message: '確認メールを再送しました',
  })
}
