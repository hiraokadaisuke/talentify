'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip'
import { createClient } from '@/utils/supabase/client'
import {
  LayoutDashboard,
  Mail,
  Calendar,
  User,
  Star,
  Wallet,
  Bell,
  Search,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

const navItems = {
  talent: [
    { href: '/talent/dashboard', label: 'ダッシュボード', icon: LayoutDashboard },
    { href: '/talent/offers', label: 'オファー一覧', icon: Mail },
    { href: '/talent/schedule', label: 'スケジュール管理', icon: Calendar },
    { href: '/talent/edit', label: 'プロフィール編集', icon: User },
    { href: '/talent/reviews', label: '評価・レビュー', icon: Star },
    { href: '/talent/payments', label: 'ギャラ管理', icon: Wallet },
    { href: '/talent/notifications', label: '通知・設定', icon: Bell },
  ],
  store: [
    { href: '/store/talents', label: '演者を探す', icon: Search },
    { href: '/store/dashboard', label: 'ダッシュボード', icon: LayoutDashboard },
    { href: '/store/offers', label: 'オファー管理', icon: Mail },
    { href: '/store/schedule', label: 'スケジュール', icon: Calendar },
    { href: '/store/messages', label: 'メッセージ', icon: Bell },
    { href: '/store/edit', label: '店舗情報', icon: User },
    { href: '/store/settings', label: '設定', icon: Star },
  ],
} as const

export default function Sidebar({
  role = 'talent',
  collapsible = false,
}: {
  role?: 'talent' | 'store'
  collapsible?: boolean
}) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [collapsed, setCollapsed] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setLoggedIn(!!session)
    }

    checkSession()

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setLoggedIn(!!session)
      }
    )

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const items = role === 'store' ? navItems.store : navItems.talent

  return (
    <div
      className={cn(
        'relative bg-background border-r shadow-sm flex flex-col justify-between h-full',
        collapsible && collapsed ? 'w-16 min-w-[64px]' : 'min-w-[220px]'
      )}
    >
      <TooltipProvider delayDuration={0}>
        <nav className="flex-1 space-y-2 px-2 py-4">
          {items.map(({ href, label, icon: Icon }) => {
            const itemContent = (
              <div
                className={cn(
                  'group flex items-center gap-3 rounded-2xl px-4 py-2 text-sm transition-colors hover:bg-muted',
                  pathname === href
                    ? 'bg-muted text-primary font-medium shadow-md'
                    : 'text-muted-foreground font-normal',
                  collapsed && 'justify-center px-3'
                )}
              >
                <Icon className="h-5 w-5" />
                {!collapsed && <span>{label}</span>}
              </div>
            )

            return collapsed ? (
              <Tooltip key={href}>
                <TooltipTrigger asChild>
                  <Link href={href}>{itemContent}</Link>
                </TooltipTrigger>
                <TooltipContent side="right">{label}</TooltipContent>
              </Tooltip>
            ) : (
              <Link href={href} key={href}>
                {itemContent}
              </Link>
            )
          })}
        </nav>
      </TooltipProvider>
      {loggedIn && (
        <div className="p-2">
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className={cn('w-full justify-center text-destructive px-3')}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">ログアウト</TooltipContent>
            </Tooltip>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="w-full justify-start text-destructive"
            >
              <LogOut className="h-4 w-4" />
              <span className="ml-2">ログアウト</span>
            </Button>
          )
        </div>
      )}
      {collapsible && (
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-2 hidden h-6 w-6 items-center justify-center rounded-full border bg-background shadow md:flex"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      )}
    </div>
  )
}
