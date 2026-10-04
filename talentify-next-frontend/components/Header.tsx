'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { ChevronDown, Menu } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from './ui/dropdown-menu'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from './ui/sheet'
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
  '/areas',
  '/column',
  '/contact',
  '/faq',
  '/guide',
  '/login',
  '/news',
  '/password-reset',
  '/pricing',
  '/privacy',
  '/service',
  '/register',
  '/stores',
  '/performers',
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
      { href: '/store/invoices', label: '見積・請求管理' },
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
      { href: '/talent/invoices', label: '見積・請求管理' },
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
    (pathname?.startsWith('/store/') ||
    pathname === '/search' ||
    pathname?.startsWith('/search/') ||
    pathname === '/talents' ||
    pathname?.startsWith('/talents/')
      ? 'store'
      : pathname?.startsWith('/talent/')
        ? 'talent'
        : undefined)

  const isEventsPage =
    !!pathname && (pathname === '/events' || pathname.startsWith('/events/'))

  const isPublicPage =
    !inferredRole &&
    !!pathname &&
    (PUBLIC_HEADER_PATHS.has(pathname) ||
      pathname.startsWith('/guide/') ||
      pathname.startsWith('/column/') ||
      pathname.startsWith('/news/') ||
      pathname.startsWith('/faq/') ||
      pathname.startsWith('/stores/') ||
      pathname.startsWith('/performers/') ||
      pathname.startsWith('/password-reset/'))

  const roleNav = inferredRole ? ROLE_MENUS[inferredRole] : null
  const homeHref = roleNav?.homeHref ?? '/'
  const isHomeActive = !!roleNav && pathname === roleNav.homeHref
  const isPrimaryActive =
    !!roleNav?.primaryHref &&
    (pathname === roleNav.primaryHref || pathname.startsWith(roleNav.primaryHref + '/'))
  const isFavoritesActive =
    inferredRole === 'store' &&
    (pathname === '/store/favorites' || pathname.startsWith('/store/favorites/'))
  const primaryGuideLink = GUIDE_LINKS[0]
  const isGuideActive = GUIDE_LINKS.some((item) => pathname === item.href || pathname.startsWith(item.href + '/'))
  const navItemBaseClass =
    'relative inline-flex h-10 items-center whitespace-nowrap rounded-lg px-2.5 text-[13px] font-semibold text-slate-600 transition-all duration-150 hover:bg-slate-100 hover:text-slate-950 xl:px-3 xl:text-sm'
  const navItemActiveClass =
    'bg-orange-50 text-[#C2410C] after:absolute after:inset-x-2.5 after:bottom-0 after:h-0.5 after:rounded-full after:bg-[#FF5A1F]'
  const dropdownItemClass =
    'cursor-pointer rounded-md px-2 py-1.5 text-slate-700 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-900 focus:bg-slate-100 focus:text-slate-900'
  const mobileLinkClass =
    'flex min-h-11 w-full items-center rounded-xl px-3 text-[15px] font-semibold text-slate-700 transition-colors hover:bg-slate-100'
  const mobileActiveClass = 'bg-orange-50 text-[#C2410C]'

  if (pathname === '/' || pathname === '/service') {
    return null
  }

  if (isEventsPage) {
    return (
      <header className="fixed top-0 z-[var(--z-header)] h-16 w-full border-b border-white/10 bg-[#081426]/[0.96] text-white shadow-[0_8px_30px_rgba(0,0,0,.18)] backdrop-blur-xl">
        <div className="mx-auto flex h-full w-full max-w-[1500px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-10">
          <Link href="/events" className="flex min-w-0 items-center gap-2">
            <img src="/brand/raiten-navi-logo.svg" alt="来店ナビ" className="h-8 w-auto sm:h-9" />
            <span className="hidden border-l border-white/15 pl-3 text-xs font-black tracking-[0.08em] text-white/60 sm:inline">
              来店情報
            </span>
          </Link>

          <nav className="flex items-center gap-1 sm:gap-2">
            {[
              { href: '/areas', label: '地域' },
              { href: '/stores', label: '店舗' },
              { href: '/events?view=today', label: '今日' },
              { href: '/events?view=week', label: '今週' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex h-9 items-center rounded-lg px-2.5 text-xs font-black text-white/70 transition hover:bg-white/8 hover:text-white sm:px-3 sm:text-sm"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden shrink-0 sm:block">
            {!isLoading && userName ? (
              <Button asChild size="sm" className="rounded-full bg-white text-slate-950 hover:bg-white/90">
                <Link href="/dashboard">管理画面へ</Link>
              </Button>
            ) : (
              <Link
                href="/service"
                className="inline-flex h-9 items-center rounded-full border border-white/15 px-3.5 text-xs font-bold text-white/70 transition hover:bg-white/8 hover:text-white"
              >
                店舗・演者の方
              </Link>
            )}
          </div>
        </div>
      </header>
    )
  }

  if (roleNav) {
    const displayUserName = userName ?? 'ユーザー'

    return (
      <header className="fixed top-0 z-[var(--z-header)] h-16 w-full border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex h-full w-full max-w-[1600px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-4">
            <Link href={homeHref} className="shrink-0">
              <img src="/brand/raiten-navi-logo.svg" alt="来店ナビ" className="h-8 w-auto sm:h-9" />
            </Link>

            <nav className="hidden items-center gap-1 lg:flex">
              <Link href={homeHref} className={cn(navItemBaseClass, isHomeActive ? navItemActiveClass : '')}>
                ホーム
              </Link>
              {roleNav.primaryHref && roleNav.primaryLabel && (
                <Link href={roleNav.primaryHref} className={cn(navItemBaseClass, isPrimaryActive ? navItemActiveClass : '')}>
                  {roleNav.primaryLabel}
                </Link>
              )}
              {inferredRole === 'store' && (
                <Link
                  href="/store/favorites"
                  className={cn(navItemBaseClass, isFavoritesActive ? navItemActiveClass : '')}
                >
                  お気に入り
                </Link>
              )}
              {roleNav.project.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + '/')
                const desktopLabel = item.label.replace('管理', '')
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(navItemBaseClass, active ? navItemActiveClass : '')}
                  >
                    {desktopLabel}
                  </Link>
                )
              })}
              <Link
                href={primaryGuideLink.href}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(navItemBaseClass, isGuideActive ? navItemActiveClass : '')}
              >
                {primaryGuideLink.label}
              </Link>
            </nav>
          </div>

          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <NotificationBell role={inferredRole} />

            <div className="hidden lg:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex h-10 max-w-[180px] items-center gap-1 rounded-lg px-2.5 text-[13px] font-semibold text-slate-700 transition-colors hover:bg-slate-100 xl:max-w-[220px] xl:text-sm">
                    <span className="truncate">{displayUserName}</span>
                    <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
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

            <Sheet>
              <SheetTrigger asChild>
                <button
                  type="button"
                  aria-label="メニューを開く"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-700 transition-colors hover:bg-slate-100 lg:hidden"
                >
                  <Menu className="h-6 w-6" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="p-0" style={{ width: 'min(86vw, 340px)' }}>
                <div className="border-b border-slate-200 px-5 py-5 pr-12">
                  <img src="/brand/raiten-navi-logo.svg" alt="来店ナビ" className="h-8 w-auto" />
                  <p className="mt-1 truncate text-sm text-slate-500">{displayUserName}</p>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
                  <div className="space-y-1">
                    <SheetClose asChild>
                      <Link
                        href={homeHref}
                        className={cn(mobileLinkClass, isHomeActive ? mobileActiveClass : '')}
                      >
                        ホーム
                      </Link>
                    </SheetClose>

                    {roleNav.primaryHref && roleNav.primaryLabel && (
                      <SheetClose asChild>
                        <Link
                          href={roleNav.primaryHref}
                          className={cn(mobileLinkClass, isPrimaryActive ? mobileActiveClass : '')}
                        >
                          {roleNav.primaryLabel}
                        </Link>
                      </SheetClose>
                    )}
                    {inferredRole === 'store' && (
                      <SheetClose asChild>
                        <Link
                          href="/store/favorites"
                          className={cn(mobileLinkClass, isFavoritesActive ? mobileActiveClass : '')}
                        >
                          お気に入り
                        </Link>
                      </SheetClose>
                    )}
                  </div>

                  <div className="my-4 border-t border-slate-200" />

                  <p className="px-3 pb-2 text-xs font-bold tracking-[0.08em] text-slate-400">案件管理</p>
                  <div className="space-y-1">
                    {roleNav.project.map((item) => {
                      const active = pathname === item.href || pathname.startsWith(item.href + '/')
                      return (
                        <SheetClose asChild key={item.href}>
                          <Link href={item.href} className={cn(mobileLinkClass, active ? mobileActiveClass : '')}>
                            {item.label}
                          </Link>
                        </SheetClose>
                      )
                    })}
                  </div>

                  <div className="my-4 border-t border-slate-200" />

                  <SheetClose asChild>
                    <Link
                      href={primaryGuideLink.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(mobileLinkClass, isGuideActive ? mobileActiveClass : '')}
                    >
                      ご利用ガイド
                    </Link>
                  </SheetClose>

                  <div className="my-4 border-t border-slate-200" />

                  <p className="px-3 pb-2 text-xs font-bold tracking-[0.08em] text-slate-400">アカウント</p>
                  <div className="space-y-1">
                    {roleNav.account.map((item) => {
                      const active = pathname === item.href || pathname.startsWith(item.href + '/')
                      return (
                        <SheetClose asChild key={item.href}>
                          <Link href={item.href} className={cn(mobileLinkClass, active ? mobileActiveClass : '')}>
                            {item.label}
                          </Link>
                        </SheetClose>
                      )
                    })}
                  </div>
                </div>

                <div className="border-t border-slate-200 p-3">
                  <SheetClose asChild>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex min-h-11 w-full items-center rounded-xl px-3 text-left text-[15px] font-semibold text-red-600 transition-colors hover:bg-red-50"
                    >
                      ログアウト
                    </button>
                  </SheetClose>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    )
  }

  if (isPublicPage) {
    const publicLinks = [
      { href: '/', label: '来店情報' },
      { href: '/areas', label: '地域から探す' },
      { href: '/stores', label: '店舗から探す' },
      { href: '/performers', label: '演者から探す' },
      { href: '/service', label: '店舗・演者の方' },
    ]

    return (
      <header className="fixed top-0 z-[var(--z-header)] h-16 w-full border-b border-white/10 bg-[#081426]/[0.94] text-white shadow-[0_8px_30px_rgba(0,0,0,.22)] backdrop-blur-xl">
        <div className="mx-auto flex h-full w-full max-w-[1500px] items-center justify-between px-4 sm:px-6 lg:px-10">
          <Link href="/" className="flex items-center">
            <img src="/brand/raiten-navi-logo.svg" alt="来店ナビ" className="h-9 w-auto sm:h-10" />
          </Link>

          <nav className="flex items-center gap-1 sm:gap-3">
            {publicLinks.map((link, index) => {
              const active =
                pathname === link.href ||
                (link.href === '/stores' && pathname.startsWith('/stores/')) ||
                (link.href === '/performers' && pathname.startsWith('/performers/'))
              const mobileVisible = index === 1 || index === 2
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'rounded-lg px-2 py-2 text-xs font-bold transition sm:px-2.5 sm:text-sm',
                    mobileVisible ? 'inline-flex' : 'hidden sm:inline-flex',
                    active ? 'bg-white/10 text-[#FFC400]' : 'text-white/70 hover:bg-white/8 hover:text-white',
                  )}
                >
                  <span className="sm:hidden">{link.label.replace('から探す', '')}</span>
                  <span className="hidden sm:inline">{link.label}</span>
                </Link>
              )
            })}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            {!isLoading && userName ? (
              <Button asChild size="sm" className="rounded-full bg-white text-slate-950 hover:bg-white/90">
                <Link href="/dashboard">ダッシュボード</Link>
              </Button>
            ) : (
              <>
                <Link href="/login" className="px-3 py-2 text-sm font-bold text-white/70 hover:text-white">
                  ログイン
                </Link>
                <Link
                  href="/service#register"
                  className="inline-flex h-9 items-center rounded-full bg-gradient-to-r from-[#FF3B2E] via-[#FF8A00] to-[#FFC400] px-4 text-xs font-black text-white shadow-[0_0_18px_rgba(255,138,0,.28)] sm:text-sm"
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
      <div className="mx-auto flex h-full w-full max-w-[1400px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href={homeHref}><img src="/brand/raiten-navi-logo.svg" alt="来店ナビ" className="h-8 w-auto sm:h-9" /></Link>
        {!isLoading && !userName && (
          <Button asChild variant="outline" size="sm" className="ml-auto">
            <Link href="/login">ログイン</Link>
          </Button>
        )}
      </div>
    </header>
  )
}
