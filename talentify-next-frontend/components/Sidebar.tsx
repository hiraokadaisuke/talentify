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

const navItems = [
  { href: '/talent/dashboard', label: 'ダッシュボード', icon: LayoutDashboard },
  { href: '/talent/offers', label: 'オファー一覧', icon: Mail },
  { href: '/talent/schedule', label: 'スケジュール管理', icon: Calendar },
  { href: '/talent/edit', label: 'プロフィール編集', icon: User },
  { href: '/talent/reviews', label: '評価・レビュー', icon: Star },
  { href: '/talent/payments', label: 'ギャラ管理', icon: Wallet },
  { href: '/talent/notifications', label: '通知・設定', icon: Bell },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <nav className="space-y-2">
      {navItems.map(({ href, label, icon: Icon }) => (
        <Link href={href} key={href}>
          <div
            className={cn(
              'flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-medium transition-colors',
              pathname === href
                ? 'bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
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
