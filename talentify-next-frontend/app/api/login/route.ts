import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  const csrfCookie = cookies().get('csrfToken')?.value
  const csrfHeader = req.headers.get('x-csrf-token')
  if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
    return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 })
  }

  const { email, password } = await req.json()
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error || !data.session) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const { error: setError } = await supabase.auth.setSession({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
  })
  if (setError) {
    return NextResponse.json({ error: setError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
