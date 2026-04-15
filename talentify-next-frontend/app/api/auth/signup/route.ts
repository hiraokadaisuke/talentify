import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getRedirectUrl } from '@/lib/getRedirectUrl'
import {
  mapSupabaseSignUpError,
  signUpSchema,
  type SignupErrorCode,
} from '@/lib/auth/signup'

type ErrorResponse = {
  ok: false
  error: {
    code: SignupErrorCode
    message: string
  }
}

function errorResponse(
  status: number,
  code: SignupErrorCode,
  message: string
) {
  return NextResponse.json<ErrorResponse>(
    {
      ok: false,
      error: { code, message },
    },
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

  const { email, password, role } = parsed.data

  const supabase = createClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: getRedirectUrl(role),
      data: {
        role,
      },
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

  return NextResponse.json(
    {
      ok: true,
      data: {
        next: 'check_email',
      },
    },
    { status: 200 }
  )
}
