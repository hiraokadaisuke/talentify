'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from './ui/dropdown-menu'
import { Button } from './ui/button'
import { createClient } from '@/utils/supabase/client'
import { getUserRoleInfo } from '@/lib/getUserRole'
import NotificationBell from './notifications/NotificationBell'
import { cn } from '@/lib/utils'

interface MenuItem {
  href: string
  label: string
}

const PUBLIC_HEADER_PATHS = new Set([
  '/',
  '/about',
  '/column',
  '/company',
  '/contact',
  '/faq',
  '/guide',
  '/login',
  '/news',
  '/password-reset',
  '/pricing',
  '/privacy',
  '/register',
  '/store',
  '/talent',
  '/terms',
])

const GUIDE_LINKS: MenuItem[] = [{ href: '/guide', label: 'ご利用ガイド' }]

const ROLE_MENUS: Record<
  'store' | 'talent',
  { homeHref: string; primaryHref?: string; primaryLabel?: string; project: MenuItem[]; account: MenuItem[] }
> = {
  store: {
    homeHref: '/store/dashboard',
    primaryHref: '/search',
    primaryLabel: '演者を探す',
    project: [
      { href: '/store/offers', label: 'オファー管理' },
      { href: '/store/schedule', label: 'スケジュール管理' },
      { href: '/store/messages', label: 'メッセージ' },
    ],
    account: [
      { href: '/store/edit', label: 'プロフィール編集' },
      { href: '/store/reviews', label: 'レビュー管理' },
      { href: '/store/invoices', label: '請求管理' },
      { href: '/store/settings', label: '設定' },
    ],
  },
  talent: {
    homeHref: '/talent/dashboard',
    project: [
      { href: '/talent/offers', label: 'オファー管理' },
      { href: '/talent/schedule', label: 'スケジュール管理' },
      { href: '/talent/messages', label: 'メッセージ' },
    ],
    account: [
      { href: '/talent/edit', label: 'プロフィール編集' },
      { href: '/talent/reviews', label: 'レビュー管理' },
      { href: '/talent/invoices', label: '請求管理' },
      { href: '/talent/payments', label: 'ギャラ管理' },
      { href: '/talent/settings', label: '設定' },
    ],
  },
}

export default function Header({ sidebarRole }: { sidebarRole?: 'talent' | 'store' }) {
  const [userName, setUserName] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    const fetchSessionAndProfile = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      const user = session?.user
      if (!user) {
        setUserName(null)
        setIsLoading(false)
        return
      }

      const { name } = await getUserRoleInfo(supabase, user.id)
      setUserName(name ?? user.email?.split('@')[0] ?? 'ユーザー')
      setIsLoading(false)
    }

    fetchSessionAndProfile()
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) fetchSessionAndProfile()
      else {
        setUserName(null)
        setIsLoading(false)
      }
    })

    return () => listener.subscription.unsubscribe()
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const inferredRole =
    sidebarRole ??
    (pathname?.startsWith('/store/') ? 'store' : pathname?.startsWith('/talent/') ? 'talent' : undefined)

  const isPublicPage =
    !inferredRole &&
    !!pathname &&
    (PUBLIC_HEADER_PATHS.has(pathname) ||
      pathname.startsWith('/guide/') ||
      pathname.startsWith('/column/') ||
      pathname.startsWith('/news/') ||
      pathname.startsWith('/company/') ||
      pathname.startsWith('/faq/') ||
      pathname.startsWith('/password-reset/'))

  const roleNav = inferredRole ? ROLE_MENUS[inferredRole] : null
  const homeHref = roleNav?.homeHref ?? '/'
  const isHomeActive = !!roleNav && pathname === roleNav.homeHref
  const isPrimaryActive =
    !!roleNav?.primaryHref &&
    (pathname === roleNav.primaryHref || pathname.startsWith(roleNav.primaryHref + '/'))
  const isProjectActive =
    !!roleNav &&
    roleNav.project.some((item) => pathname === item.href || pathname.startsWith(item.href + '/'))
  const primaryGuideLink = GUIDE_LINKS[0]
  const isGuideActive = GUIDE_LINKS.some((item) => pathname === item.href || pathname.startsWith(item.href + '/'))
  const navItemBaseClass =
    'relative inline-flex h-9 items-center rounded-md px-2 text-sm font-medium text-slate-600 transition-all duration-150 hover:bg-slate-100 hover:text-slate-900'
  const navItemActiveClass =
    'text-primary after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:rounded-full after:bg-primary'
  const dropdownItemClass =
    'cursor-pointer rounded-md px-2 py-1.5 text-slate-700 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-900 focus:bg-slate-100 focus:text-slate-900'

  if (pathname === '/') {
    return null
  }

  if (roleNav) {
    const displayUserName = userName ?? 'ユーザー'

    return (
      <header className="fixed top-0 z-[var(--z-header)] h-16 w-full bg-white shadow-sm">
        <div className="mx-auto flex h-full w-full max-w-[1600px] items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-5">
            <Link href={homeHref} className="text-2xl font-bold tracking-tight">Talentify</Link>
            <Link href={homeHref} className={cn(navItemBaseClass, isHomeActive ? navItemActiveClass : '')}>ホーム</Link>
            {roleNav.primaryHref && roleNav.primaryLabel && (
              <Link href={roleNav.primaryHref} className={cn(navItemBaseClass, isPrimaryActive ? navItemActiveClass : '')}>
                {roleNav.primaryLabel}
              </Link>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={cn(navItemBaseClass, 'gap-1', isProjectActive ? navItemActiveClass : '')}>
                  案件管理
                  <ChevronDown className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {roleNav.project.map((item) => (
                  <DropdownMenuItem asChild key={item.href} className={dropdownItemClass}>
                    <Link href={item.href}>{item.label}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Link
              href={primaryGuideLink.href}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(navItemBaseClass, isGuideActive ? navItemActiveClass : '')}
            >
              {primaryGuideLink.label}
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <NotificationBell />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex h-9 items-center gap-1 rounded-md px-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100">
                  {displayUserName}
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {roleNav.account.map((item) => (
                  <DropdownMenuItem asChild key={item.href} className={dropdownItemClass}>
                    <Link href={item.href}>{item.label}</Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={handleLogout} className="cursor-pointer text-destructive">
                  ログアウト
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
    )
  }

  if (isPublicPage) {
    const publicLinks = [
      { href: '/', label: 'サービス' },
      { href: '/store', label: '店舗向け' },
      { href: '/talent', label: '演者向け' },
      { href: '/guide', label: 'ご利用ガイド' },
    ]

    return (
      <header className="fixed top-0 z-[var(--z-header)] h-16 w-full border-b border-white/10 bg-[#05050d]/88 text-white shadow-[0_8px_30px_rgba(0,0,0,.22)] backdrop-blur-xl">
        <div className="mx-auto flex h-full w-full max-w-[1500px] items-center justify-between px-4 sm:px-6 lg:px-10">
          <Link href="/" className="flex items-center">
            <img src="/images/lp/logo.png" alt="Talentify" className="h-8 w-auto sm:h-9" />
          </Link>

          <nav className="hidden items-center gap-6 lg:flex">
            {publicLinks.map((link) => {
              const active = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'text-sm font-bold transition',
                    active ? 'text-pink-300' : 'text-white/70 hover:text-white',
                  )}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center gap-2">
            {!isLoading && userName ? (
              <Button asChild size="sm" className="rounded-full bg-white text-slate-950 hover:bg-white/90">
                <Link href="/dashboard">ダッシュボード</Link>
              </Button>
            ) : (
              <>
                <Link href="/login" className="hidden px-3 py-2 text-sm font-bold text-white/70 hover:text-white sm:inline-flex">
                  ログイン
                </Link>
                <Link
                  href="/#choose-role"
                  className="inline-flex h-9 items-center rounded-full bg-gradient-to-r from-orange-400 to-pink-500 px-4 text-xs font-black text-white shadow-[0_0_18px_rgba(236,72,153,.25)] sm:text-sm"
                >
                  新規登録
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="fixed top-0 z-[var(--z-header)] h-16 w-full bg-white shadow-sm">
      <div className="mx-auto flex h-full w-full max-w-[1400px] items-center justify-between px-6 lg:px-8">
        <Link href={homeHref} className="text-2xl font-bold tracking-tight">Talentify</Link>
        {!isLoading && !userName && (
          <Button asChild variant="outline" size="sm" className="ml-auto">
            <Link href="/login">ログイン</Link>
          </Button>
        )}
      </div>
    </header>
  )
}
