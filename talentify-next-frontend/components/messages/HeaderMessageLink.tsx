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

  const refreshCount = async () => {
    if (!role) return
    const c = await getUnreadMessageCount(role)
    setCount(c)
  }

  useEffect(() => {
    if (!role) return
    refreshCount()
    const channel = supabase
      .channel('header-message')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => {
        refreshCount()
      })
      .subscribe()
    const interval = setInterval(refreshCount, 60000)
    return () => {
      supabase.removeChannel(channel)
      clearInterval(interval)
    }
  }, [role])

  if (!role) return null
  const href = `/${role}/messages`
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
