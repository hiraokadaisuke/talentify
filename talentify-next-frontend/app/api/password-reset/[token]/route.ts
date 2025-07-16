import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  // Supabaseクライアントをawaitで取得

  // リクエストボディから password と email を取得
  const { password, email } = await request.json()

  // URLパラメータから token を取得
  const { token } = params

  // OTP（ワンタイムパスワード）検証に email も渡す
  const { error: verifyError } = await supabase.auth.verifyOtp({
    type: 'recovery',
    token,
    email,  // ここ重要
  })

  // 検証エラーの場合は400で返す
  if (verifyError) {
    return NextResponse.json<{ error: string }>({ error: verifyError.message }, { status: 400 })
  }

  // パスワード更新
  const { error } = await supabase.auth.updateUser({ password })
  if (error) {
    return NextResponse.json<{ error: string }>({ error: error.message }, { status: 500 })
  }

  // 成功レスポンス
  return NextResponse.json<{ success: boolean }>({ success: true }, { status: 200 })
}
