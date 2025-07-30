'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Bell } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

export default function NotificationBell({ role }: { role: 'talent' | 'store' }) {
  const supabase = createClient()
  const [count, setCount] = useState(0)

  useEffect(() => {
    let userId: string | null = null
    const fetchCount = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      userId = user?.id || null
      if (!userId) return
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false)
      setCount(count ?? 0)
    }

    fetchCount()

    const channel = supabase
      .channel('public:notifications')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications' },
        payload => {
          if (!userId) return
          if (payload.new.user_id === userId || payload.old?.user_id === userId) {
            fetchCount()
          }
        }
      )
    channel.subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <Link href={`/${role}/notifications`} className="relative">
      <Bell className="w-5 h-5" />
      {count > 0 && (
        <span className="absolute -top-1 -right-2 rounded-full bg-red-600 text-white text-xs px-1">
          {count}
        </span>
      )}
    </Link>
  )
}
