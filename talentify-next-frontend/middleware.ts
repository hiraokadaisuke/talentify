import { NextResponse, type NextRequest } from 'next/server'
import { createMiddlewareClient } from '@/lib/supabase/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  const supabase = createMiddlewareClient(req, res)
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const { pathname } = req.nextUrl

  if (pathname === '/' && !session) {
    return res
  }

  if (
    !session &&
    ['/dashboard', '/store', '/talent', '/profile', '/messages', '/manage'].some(
      (p) => pathname.startsWith(p)
    )
  ) {
    const loginUrl = req.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('redirectedFrom', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return res  // ← ここが重要。resを返すことでCookieが保存される
}

export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/store/:path*',
    '/talent/:path*',
    '/profile/:path*',
    '/messages/:path*',
    '/manage/:path*',
  ],
}
