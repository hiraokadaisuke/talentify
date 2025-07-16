import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  // createClient は async 関数なので await を付ける
  const { email } = await req.json()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: process.env.NEXT_PUBLIC_SITE_URL
      ? `${process.env.NEXT_PUBLIC_SITE_URL}/password-reset`
      : undefined,
  })

  if (error) {
    return NextResponse.json<{ error: string }>({ error: error.message }, { status: 500 })
  }

  return NextResponse.json<{ success: boolean }>({ success: true }, { status: 200 })
}
