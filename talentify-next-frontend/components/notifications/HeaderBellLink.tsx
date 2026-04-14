'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Bell } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { getUnreadNotificationCount, formatUnreadCount, NOTIFICATIONS_CHANGED_EVENT } from '@/utils/notifications'
import { useUserRole } from '@/utils/useRole'

const supabase = createClient()

export default function HeaderBellLink() {
  const { role } = useUserRole()
  const [count, setCount] = useState(0)

  const refreshCount = async () => {
    const c = await getUnreadNotificationCount()
    setCount(c)
  }

  useEffect(() => {
    refreshCount()
    const channel = supabase
      .channel('header-bell')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => {
        refreshCount()
      })
      .subscribe()
    const onLocalNotificationsChanged = () => refreshCount()
    window.addEventListener(NOTIFICATIONS_CHANGED_EVENT, onLocalNotificationsChanged)
    const onVisible = () => {
      if (document.visibilityState === 'visible') refreshCount()
    }
    document.addEventListener('visibilitychange', onVisible)
    const interval = setInterval(refreshCount, 60000)
    return () => {
      supabase.removeChannel(channel)
      window.removeEventListener(NOTIFICATIONS_CHANGED_EVENT, onLocalNotificationsChanged)
      document.removeEventListener('visibilitychange', onVisible)
      clearInterval(interval)
    }
  }, [])

  if (!role) return null
  const href = `/${role}/notifications`
  const formatted = formatUnreadCount(count)

  return (
    <Link
      href={href}
      aria-label="通知"
      className="relative rounded-full p-2 text-slate-600 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-900 focus:outline-none"
    >
      <Bell className="h-6 w-6" />
      {formatted && (
        <span
          aria-live="polite"
          className="absolute -top-1 -right-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1 text-xs text-white"
        >
          {formatted}
        </span>
      )}
    </Link>
  )
}
