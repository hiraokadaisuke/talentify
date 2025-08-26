import { NextResponse, type NextRequest } from 'next/server'
import { createMiddlewareClient } from '@/lib/supabase/server'
import { getUserRoleInfo } from '@/lib/getUserRole'

export async function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith('/auth/callback')) {
    return NextResponse.next()
  }

  const res = NextResponse.next()

  const supabase = createMiddlewareClient(req, res)
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const { pathname } = req.nextUrl

  if (session?.user) {
    const { role } = await getUserRoleInfo(supabase, session.user.id)

    if ((role === 'store' || role === 'talent') && pathname.startsWith('/messages')) {
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = `/${role}${pathname}`
      return NextResponse.redirect(redirectUrl)
    }

    if (pathname.startsWith('/store') && role !== 'store') {
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = role ? `/${role}/dashboard` : '/login'
      return NextResponse.redirect(redirectUrl)
    }

    if (pathname.startsWith('/talent') && role !== 'talent') {
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = role ? `/${role}/dashboard` : '/login'
      return NextResponse.redirect(redirectUrl)
    }
  }

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
