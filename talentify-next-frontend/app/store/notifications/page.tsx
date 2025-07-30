'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { NotificationItem } from '@/components/ui/notification-item'
import type { Notification } from '@/types/ui'

export default function StoreNotificationsPage() {
  const supabase = createClient()
  const [items, setItems] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      setItems((data as any[]) as Notification[] || [])
      setLoading(false)
    }
    load()
  }, [])

  const markRead = async (id: string) => {
    const { data } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (data) setItems(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
  }

  const linkFor = (n: Notification) => {
    if (n.type === 'message') return '/messages'
    if (n.offer_id) return `/store/offers/${n.offer_id}`
    return undefined
  }

  return (
    <div className="max-w-screen-md mx-auto py-8 space-y-4">
      <h1 className="text-2xl font-bold">通知一覧</h1>
      {loading ? (
        <p>Loading...</p>
      ) : items.length === 0 ? (
        <p>通知はありません</p>
      ) : (
        <ul className="space-y-2">
          {items.map(n => {
            const href = linkFor(n)
            const content = (
              <NotificationItem notification={n} className="cursor-pointer" />
            )
            return (
              <li key={n.id} onClick={() => markRead(n.id)}>
                {href ? <Link href={href}>{content}</Link> : content}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
