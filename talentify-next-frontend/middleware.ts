import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import type { Database } from './types/supabase'
import { getUserRoleInfo } from './lib/getUserRole'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options) {
          res.cookies.set({ name, value, ...options })
        },
        remove(name: string, options) {
          res.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

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
