import { createClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'

export async function POST(request: NextRequest, { params }: any) {
  const supabase = createClient()
  const { password } = await request.json()
  const { token } = params as { token: string }

  const { error: verifyError } = await supabase.auth.verifyOtp({
    type: 'recovery',
    token_hash: token,
  })

  if (verifyError) {
    return new Response(JSON.stringify({ error: verifyError.message }), { status: 400 })
  }

  const { error } = await supabase.auth.updateUser({ password })
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 })
}
