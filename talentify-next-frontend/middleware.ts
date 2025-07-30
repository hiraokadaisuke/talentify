import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from './types/supabase'
import { createMiddlewareClient } from './lib/supabase/server'
import { getUserRoleInfo } from './lib/getUserRole'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient(req, res)

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const isLoggedIn = !!session
  const { pathname } = req.nextUrl

  if (pathname === '/' && !isLoggedIn) {
    return res
  }

  if (isLoggedIn) {
    const { role, isSetupComplete } = await getUserRoleInfo(
      supabase,
      session!.user.id
    )
    const editPath = role ? `/${role}/edit` : null

    if (editPath && pathname.startsWith(editPath)) {
      return res
    }

    if (role && isSetupComplete === false && !pathname.startsWith(editPath || '')) {
      const url = req.nextUrl.clone()
      url.pathname = editPath!
      return NextResponse.redirect(url)
    }
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

  return res
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
