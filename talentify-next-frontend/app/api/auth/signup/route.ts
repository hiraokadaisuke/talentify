import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { getRedirectUrl } from '@/lib/getRedirectUrl'
import { upsertAppUser } from '@/lib/auth/app-user'
import {
  mapSupabaseSignUpError,
  signUpSchema,
  type SignupErrorCode,
} from '@/lib/auth/signup'

type ErrorResponse = {
  ok: false
  error: { code: SignupErrorCode; message: string }
}

function errorResponse(status: number, code: SignupErrorCode, message: string) {
  return NextResponse.json<ErrorResponse>(
    { ok: false, error: { code, message } },
    { status }
  )
}

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return errorResponse(400, 'INVALID_INPUT', 'リクエスト形式が正しくありません')
  }

  const parsed = signUpSchema.safeParse(body)
  if (!parsed.success) {
    return errorResponse(400, 'INVALID_INPUT', '入力内容を確認してください')
  }

  const { email, phone, password, role } = parsed.data
  const supabase = createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: getRedirectUrl(role),
    },
  })

  if (error) {
    const code = mapSupabaseSignUpError(error)
    if (code === 'RATE_LIMITED') {
      return errorResponse(429, code, '確認メールの送信回数が上限に達しています')
    }
    if (code === 'EMAIL_ALREADY_EXISTS') {
      return errorResponse(409, code, 'このメールアドレスは既に登録されています')
    }
    if (code === 'INVALID_EMAIL') {
      return errorResponse(400, code, 'メールアドレスの形式が正しくありません')
    }
    return errorResponse(400, code, '登録に失敗しました')
  }

  if (!data.user?.id || !data.user.email) {
    return errorResponse(500, 'SIGNUP_FAILED', '登録情報の作成に失敗しました')
  }

  try {
    await upsertAppUser({
      authUserId: data.user.id,
      email: data.user.email,
      phone,
      role,
      status: 'pending_email_verification',
    })
  } catch (appUserError) {
    console.error('failed to create app user on signup', appUserError)
    try {
      await createServiceClient().auth.admin.deleteUser(data.user.id)
    } catch (rollbackError) {
      console.error('failed to rollback auth user after app-user failure', rollbackError)
    }
    return errorResponse(500, 'SIGNUP_FAILED', '登録情報の作成に失敗しました')
  }

  return NextResponse.json({ ok: true, data: { next: 'check_email' } })
}
