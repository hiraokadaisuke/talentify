'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { MessageSquare } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { getUnreadMessageCount } from '@/utils/messages'
import { formatUnreadCount } from '@/utils/notifications'
import { useUserRole } from '@/utils/useRole'

const supabase = createClient()

export default function HeaderMessageLink() {
  const { role } = useUserRole()
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (role !== 'store' && role !== 'talent') return

    const refresh = async () => {
      const c = await getUnreadMessageCount()
      setCount(c)
    }

    refresh()
    const channel = supabase
      .channel('header-message')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'offer_messages' },
        refresh,
      )
      .subscribe()
    const interval = setInterval(refresh, 60000)
    return () => {
      supabase.removeChannel(channel)
      clearInterval(interval)
    }
  }, [role])

  if (role !== 'store' && role !== 'talent') return null
  const href = role === 'talent' ? '/talent/messages' : '/store/messages'
  const formatted = formatUnreadCount(count)

  return (
    <Link
      href={href}
      aria-label="メッセージ"
      className="relative p-2 rounded-full hover:bg-muted focus:outline-none"
    >
      <MessageSquare className="h-6 w-6" />
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
