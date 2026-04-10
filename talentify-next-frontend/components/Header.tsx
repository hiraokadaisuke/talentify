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
import HeaderBellLink from './notifications/HeaderBellLink'
import { cn } from '@/lib/utils'

interface MenuItem {
  href: string
  label: string
}

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
      const displayName = name ?? user.email?.split('@')[0] ?? 'ユーザー'
      setUserName(displayName)
      setIsLoading(false)
    }

    fetchSessionAndProfile()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchSessionAndProfile()
      } else {
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

  const isLoggedIn = !!userName
  const inferredRole =
    sidebarRole ??
    (pathname?.startsWith('/store') ? 'store' : pathname?.startsWith('/talent') ? 'talent' : undefined)
  const roleNav = inferredRole ? ROLE_MENUS[inferredRole] : null
  const homeHref = roleNav?.homeHref ?? '/'

  const isHomeActive = !!roleNav && pathname === roleNav.homeHref
  const isPrimaryActive =
    !!roleNav?.primaryHref &&
    (pathname === roleNav.primaryHref || pathname.startsWith(`${roleNav.primaryHref}/`))
  const isProjectActive =
    !!roleNav &&
    roleNav.project.some((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
  const isGuideActive = pathname === '/guide'
  const navItemBaseClass =
    'relative inline-flex h-9 items-center rounded-md px-2 text-sm font-medium text-slate-600 transition-all duration-150 hover:bg-slate-100 hover:text-slate-900'
  const navItemActiveClass = 'text-primary after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:rounded-full after:bg-primary'
  const dropdownItemClass =
    'cursor-pointer rounded-md px-2 py-1.5 text-slate-700 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-900 focus:bg-slate-100 focus:text-slate-900'

  if (roleNav) {
    const displayUserName = userName ?? 'ユーザー'

    return (
      <header className="fixed top-0 w-full h-16 bg-white shadow-sm z-[var(--z-header)]">
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-5">
            <Link href={homeHref} className="text-2xl font-bold tracking-tight">
              Talentify
            </Link>
            <Link
              href={homeHref}
              className={cn(
                navItemBaseClass,
                isHomeActive ? navItemActiveClass : '',
              )}
            >
              ホーム
            </Link>
            {roleNav.primaryHref && roleNav.primaryLabel && (
              <Link
                href={roleNav.primaryHref}
                className={cn(
                  navItemBaseClass,
                  isPrimaryActive ? navItemActiveClass : '',
                )}
              >
                {roleNav.primaryLabel}
              </Link>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={cn(
                    navItemBaseClass,
                    'gap-1',
                    isProjectActive ? navItemActiveClass : '',
                  )}
                >
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
              href="/guide"
              className={cn(
                navItemBaseClass,
                isGuideActive ? navItemActiveClass : '',
              )}
            >
              ご利用ガイド
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <HeaderBellLink />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex h-9 items-center gap-1 rounded-md px-2 text-sm font-semibold text-slate-700 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-900 focus:outline-none">
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
                <DropdownMenuItem
                  onSelect={handleLogout}
                  className="cursor-pointer rounded-md px-2 py-1.5 text-destructive transition-colors duration-150 hover:bg-red-50 focus:bg-red-50 focus:text-destructive"
                >
                  ログアウト
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="fixed top-0 w-full h-16 bg-white shadow-sm z-[var(--z-header)]">
      <div className="mx-auto flex h-full max-w-5xl items-center justify-between p-4">
        <Link href={homeHref} className="text-2xl font-bold tracking-tight">
          Talentify
        </Link>

        {!isLoading && (
          <nav className="hidden md:flex justify-between items-center w-full text-sm">
            <div className="flex space-x-6 ml-6">
              <Link href="/about" className="hover:underline">Talentifyについて</Link>
              <Link href="/faq" className="hover:underline">FAQ</Link>
              <Link href="/contact" className="hover:underline">お問い合わせ</Link>
            </div>

            <div className="flex items-center space-x-2 ml-auto">
              {!isLoggedIn ? (
                <>
                  <span className="text-black text-sm font-normal mr-2">今すぐ無料登録♬</span>
                  <Link
                    href="/register?role=store"
                    className="rounded-full bg-[#daa520] text-white font-normal px-5 py-2 hover:brightness-110 transition"
                  >
                    店舗の方はこちら
                  </Link>
                  <Link
                    href="/register?role=talent"
                    className="rounded-full bg-[#daa520] text-white font-normal px-5 py-2 hover:brightness-110 transition"
                  >
                    演者の方はこちら
                  </Link>
                  <Link
                    href="/login"
                    className="border border-[#daa520] text-[#daa520] font-normal rounded-full px-5 py-2 hover:bg-[#fef8e7] transition"
                  >
                    ログイン
                  </Link>
                </>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-baseline font-semibold focus:outline-none">
                      <span className="text-base">{userName}</span>
                      <span className="ml-1 text-sm text-muted-foreground align-top">様</span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href="/terms">利用規約</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/privacy">プライバシーポリシー</Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </nav>
        )}

        {!isLoading && !isLoggedIn && (
          <Button asChild variant="outline" size="sm" className="ml-auto md:hidden hover:bg-muted">
            <Link href="/login">ログイン</Link>
          </Button>
        )}
      </div>
    </header>
  )
}
