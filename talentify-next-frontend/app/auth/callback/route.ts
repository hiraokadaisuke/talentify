import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const role = url.searchParams.get('role') ?? undefined

  if (!code) {
    return NextResponse.redirect(new URL('/auth/error', url))
  }

  const supabase = createClient()

  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) {
    console.error('exchange error:', error)
    return NextResponse.redirect(new URL('/auth/error', url))
  }

  const redirect =
    role === 'store'
      ? '/store/edit'
      : role === 'talent'
      ? '/talent/edit'
      : '/dashboard'

  return NextResponse.redirect(new URL(redirect, url))
}
