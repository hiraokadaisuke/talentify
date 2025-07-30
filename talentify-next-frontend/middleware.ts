import { NextResponse, type NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const isLoggedIn = Boolean(req.cookies.get('sb-access-token')?.value)
  const { pathname } = req.nextUrl

  if (pathname === '/' && !isLoggedIn) {
    return NextResponse.next()
  }


  if (
    !isLoggedIn &&
    ['/dashboard', '/store', '/talent', '/profile', '/messages', '/manage'].some(
      (p) => pathname.startsWith(p)
    )
  ) {
    const loginUrl = req.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('redirectedFrom', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
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
