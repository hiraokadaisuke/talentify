import { createClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'

export async function POST(request: NextRequest, { params }: any) {
  // Supabaseクライアントをawaitで取得
  const supabase = await createClient()

  // リクエストボディから password と email を取得
  const { password, email } = await request.json()

  // URLパラメータから token を取得
  const { token } = params as { token: string }

  // OTP（ワンタイムパスワード）検証に email も渡す
  const { error: verifyError } = await supabase.auth.verifyOtp({
    type: 'recovery',
    token,
    email,  // ここ重要
  })

  // 検証エラーの場合は400で返す
  if (verifyError) {
    return new Response(JSON.stringify({ error: verifyError.message }), { status: 400 })
  }

  // パスワード更新
  const { error } = await supabase.auth.updateUser({ password })
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  // 成功レスポンス
  return new Response(JSON.stringify({ success: true }), { status: 200 })
}
