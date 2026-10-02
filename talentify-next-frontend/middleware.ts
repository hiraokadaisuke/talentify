import { NextResponse, type NextRequest } from 'next/server'
import { createMiddlewareClient } from '@/lib/supabase/server'
import { getUserRoleInfo, type AppUserStatus, type UserRole } from '@/lib/getUserRole'

function homeForRole(role: UserRole | null) {
  if (role === 'store') return '/store/dashboard'
  if (role === 'talent') return '/talent/dashboard'
  return '/account/role'
}

function isUserRole(value: unknown): value is UserRole {
  return value === 'store' || value === 'talent'
}

function isAppUserStatus(value: unknown): value is AppUserStatus {
  return (
    value === 'pending_email_verification' ||
    value === 'onboarding' ||
    value === 'active' ||
    value === 'suspended'
  )
}

async function getAccessState(
  supabase: ReturnType<typeof createMiddlewareClient>,
  userId: string,
): Promise<{ role: UserRole | null; status: AppUserStatus | null }> {
  const { data: appUser, error } = await supabase
    .from('users')
    .select('role, status')
    .eq('auth_user_id', userId)
    .maybeSingle()

  if (!error && appUser) {
    return {
      role: isUserRole(appUser.role) ? appUser.role : null,
      status: isAppUserStatus(appUser.status) ? appUser.status : null,
    }
  }

  // Legacy fallback for accounts that predate the users.role field.
  const legacy = await getUserRoleInfo(supabase, userId)
  return { role: legacy.role, status: legacy.status }
}

function nextWithAuthContext(
  req: NextRequest,
  res: NextResponse,
  context: {
    userId: string
    role: UserRole | null
    status: AppUserStatus | null
  },
) {
  const requestHeaders = new Headers(req.headers)
  requestHeaders.set('x-raiten-user-id', context.userId)

  if (context.role) {
    requestHeaders.set('x-raiten-user-role', context.role)
  } else {
    requestHeaders.delete('x-raiten-user-role')
  }

  if (context.status) {
    requestHeaders.set('x-raiten-user-status', context.status)
  } else {
    requestHeaders.delete('x-raiten-user-status')
  }

  const next = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  res.cookies.getAll().forEach((cookie) => {
    next.cookies.set(cookie)
  })

  return next
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
    pathname === '/' ||
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
    '/notifications',
    '/account/',
    '/admin',
  ].some((prefix) => pathname.startsWith(prefix))

  if (!user) {
    if (!protectedPath) return res
    const loginUrl = req.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('redirectedFrom', pathname)
    return NextResponse.redirect(loginUrl)
  }

  const { role, status } = await getAccessState(supabase, user.id)

  if (status === 'suspended' && pathname !== '/account/suspended') {
    return redirectWithCookies(req, res, '/account/suspended')
  }

  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    return nextWithAuthContext(req, res, { userId: user.id, role, status })
  }

  if (!role) {
    if (pathname === '/account/role') {
      return nextWithAuthContext(req, res, { userId: user.id, role, status })
    }
    if (protectedPath) return redirectWithCookies(req, res, '/account/role')
    return nextWithAuthContext(req, res, { userId: user.id, role, status })
  }

  if (pathname === '/account/role' || pathname === '/account/suspended') {
    return redirectWithCookies(req, res, homeForRole(role))
  }

  if (pathname === '/dashboard') {
    const table = role === 'store' ? 'stores' : 'talents'
    const { data: profile } = await supabase
      .from(table)
      .select('is_setup_complete')
      .eq('user_id', user.id)
      .maybeSingle()

    const nextPath = profile?.is_setup_complete
      ? homeForRole(role)
      : role === 'store'
        ? '/store/edit'
        : '/talent/edit'

    return redirectWithCookies(req, res, nextPath)
  }

  if (pathname.startsWith('/notifications')) {
    return redirectWithCookies(req, res, '/' + role + '/notifications')
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

  return nextWithAuthContext(req, res, { userId: user.id, role, status })
}

export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/app/:path*',
    '/store/:path*',
    '/talent/:path*',
    '/messages/:path*',
    '/notifications/:path*',
    '/account/:path*',
    '/admin/:path*',
  ],
}
