// components/Sidebar.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Mail,
  Calendar,
  User,
  Star,
  Wallet,
  Bell,
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
    { href: '/store/dashboard', label: 'ダッシュボード', icon: LayoutDashboard },
    { href: '/store/offers', label: 'オファー管理', icon: Mail },
    { href: '/store/schedule', label: 'スケジュール', icon: Calendar },
    { href: '/store/messages', label: 'メッセージ', icon: Bell },
    { href: '/store/edit', label: '店舗情報', icon: User },
    { href: '/store/settings', label: '設定', icon: Star },
  ],
} as const

export default function Sidebar({ role = 'talent' }: { role?: 'talent' | 'store' }) {
  const pathname = usePathname()

  const items = role === 'store' ? navItems.store : navItems.talent

  return (
    <nav className="space-y-2">
      {items.map(({ href, label, icon: Icon }) => (
        <Link href={href} key={href}>
          <div
            className={cn(
              'flex items-center gap-3 px-4 py-2 rounded-2xl font-semibold text-sm transition-colors hover:bg-muted',
              pathname === href ? 'bg-muted text-primary shadow-md' : 'text-muted-foreground'
            )}
          >
            <Icon className="w-5 h-5" />
            {label}
          </div>
        </Link>
      ))}
    </nav>
  )
}
