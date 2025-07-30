'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Bell } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { getUserRoleInfo } from '@/lib/getUserRole'

const supabase = createClient()

export default function NotificationBellIcon() {
  const [count, setCount] = useState(0)
  const [role, setRole] = useState<'talent' | 'store' | null>(null)

  useEffect(() => {
    const load = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      const user = session?.user
      if (!user) return
      const info = await getUserRoleInfo(supabase, user.id)
      setRole(info.role as any)
      const { count } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false)
      setCount(count || 0)
    }
    load()
  }, [])

  if (!role) return null

  const href = role === 'store' ? '/store/notifications' : '/talent/notifications'

  return (
    <Link href={href} className="relative">
      <Bell className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -top-1 -right-2 rounded-full bg-red-500 text-white text-xs px-1">
          {count}
        </span>
      )}
    </Link>
  )
}
