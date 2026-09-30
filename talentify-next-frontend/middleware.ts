import { NextResponse, type NextRequest } from 'next/server'
import { createMiddlewareClient } from '@/lib/supabase/server'
import { getUserRoleInfo, type UserRole } from '@/lib/getUserRole'

function homeForRole(role: UserRole | null) {
  if (role === 'store') return '/store/dashboard'
  if (role === 'talent') return '/talent/dashboard'
  return '/account/role'
}

function onboardingForRole(role: UserRole | null) {
  if (role === 'store') return '/store/edit'
  if (role === 'talent') return '/talent/edit'
  return '/account/role'
}

function redirectWithCookies(req: NextRequest, res: NextResponse, path: string) {
  const url = req.nextUrl.clone()
  url.pathname = path
  url.search = ''
  const redirect = NextResponse.redirect(url)
  res.cookies.getAll().forEach(({ name, value }) => redirect.cookies.set(name, value))
  return redirect
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (
    pathname.startsWith('/auth/callback') ||
    pathname.startsWith('/auth/recovery')
  ) {
    return NextResponse.next()
  }

  const res = NextResponse.next({ request: req })
  const supabase = createMiddlewareClient(req, res)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const protectedPath = [
    '/dashboard',
    '/app',
    '/store/',
    '/talent/',
    '/messages',
    '/account/',
  ].some((prefix) => pathname.startsWith(prefix))

  if (!user) {
    if (!protectedPath || pathname === '/') return res
    const loginUrl = req.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('redirectedFrom', pathname)
    return NextResponse.redirect(loginUrl)
  }

  const { role, isSetupComplete, status } = await getUserRoleInfo(supabase, user.id)

  if (status === 'suspended' && pathname !== '/account/suspended') {
    return redirectWithCookies(req, res, '/account/suspended')
  }

  if (!role) {
    if (pathname === '/account/role') return res
    if (protectedPath) return redirectWithCookies(req, res, '/account/role')
    return res
  }

  if (pathname === '/account/role' || pathname === '/account/suspended') {
    return redirectWithCookies(req, res, homeForRole(role))
  }

  if ((status === 'onboarding' || !isSetupComplete) && protectedPath) {
    const onboardingPath = onboardingForRole(role)
    if (!pathname.startsWith(onboardingPath)) {
      return redirectWithCookies(req, res, onboardingPath)
    }
  }

  if (pathname.startsWith('/messages')) {
    return redirectWithCookies(req, res, '/' + role + pathname)
  }

  if (pathname.startsWith('/store/') && role !== 'store') {
    return redirectWithCookies(req, res, homeForRole(role))
  }

  if (pathname.startsWith('/talent/') && role !== 'talent') {
    return redirectWithCookies(req, res, homeForRole(role))
  }

  if (pathname.startsWith('/app')) {
    return redirectWithCookies(req, res, '/dashboard')
  }

  return res
}

export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/app/:path*',
    '/store/:path*',
    '/talent/:path*',
    '/messages/:path*',
    '/account/:path*',
  ],
}
