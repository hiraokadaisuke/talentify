'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import Image from 'next/image'
import { createClient } from '@/utils/supabase/client'
import { ListSkeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
const supabase = createClient()

type MessageRow = {
  id: string
  sender_id: string
  receiver_id: string
  text: string
  created_at: string | null
}

type ThreadMessage = {
  id: string
  from: 'store' | 'talent'
  text: string
  time: string | null
}

interface Thread {
  id: string
  name: string
  avatar: string
  latest: string
  unread: number
  updatedAt: string | null
  messages: ThreadMessage[]
}

function groupMessages(messages: MessageRow[], userId: string | null): Thread[] {
  const map = new Map<string, Thread>()
  for (const m of messages) {
    const otherId = m.sender_id === userId ? m.receiver_id : m.sender_id
    if (!map.has(otherId)) {
      map.set(otherId, {
        id: otherId,
        name: `User ${otherId.slice(0, 8)}`,
        avatar: '/avatar-default.svg',
        latest: m.text,
        unread: 0,
        updatedAt: m.created_at,
        messages: []
      })
    }
    const th = map.get(otherId)!
    th.messages.push({
      id: m.id,
      from: m.sender_id === userId ? 'store' : 'talent',
      text: m.text,
      time: m.created_at
    })
    if (th.updatedAt && m.created_at && new Date(th.updatedAt) < new Date(m.created_at)) {
      th.updatedAt = m.created_at
      th.latest = m.text
    }
  }
  return Array.from(map.values())
}

export default function StoreMessagePage() {
  const [messages, setMessages] = useState<MessageRow[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserId(user.id)

      try {
        const res = await fetch('/api/messages')
        if (res.ok) {
          const data: MessageRow[] = await res.json()
          setMessages(data)
        }
      } catch (e) {
        console.error(e)
      }
      setLoading(false)
    }
    init()
  }, [])

  useEffect(() => {
    if (!userId) return
    const channel = supabase
      .channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
        const m = payload.new as MessageRow
        if (m.sender_id === userId || m.receiver_id === userId) {
          setMessages(prev => [...prev, m])
        }
      })
    channel.subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  const threads = useMemo(() => groupMessages(messages, userId), [messages, userId])

  useEffect(() => {
    if (threads.length && !activeId) setActiveId(threads[0].id)
  }, [threads, activeId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeId, messages])

  const activeThread = threads.find(t => t.id === activeId)

  const handleSend = async () => {
    if (!input || !activeId) return
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiver_id: activeId, text: input })
      })
      if (!res.ok) throw new Error('failed')
      setInput('')
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <main className="flex h-[80vh] border rounded overflow-hidden">
      <aside className="w-1/3 border-r overflow-y-auto">
        {loading ? (
          <ListSkeleton count={4} className='p-4' />
        ) : threads.length === 0 ? (
          <EmptyState title='まだメッセージがありません' className='p-4' />
        ) : (
          threads.sort((a,b) => {
            const aTime = a.updatedAt ? new Date(a.updatedAt).getTime() : 0
            const bTime = b.updatedAt ? new Date(b.updatedAt).getTime() : 0
            return bTime - aTime
          }).map(thread => (
            <div key={thread.id} className={`flex items-center px-4 py-3 cursor-pointer hover:bg-gray-50 ${activeId===thread.id?'bg-gray-100':''}`} onClick={() => setActiveId(thread.id)}>
              <Image src={thread.avatar} alt="avatar" width={40} height={40} className="rounded-full mr-3" />
              <div className="flex-1">
                <p className="font-semibold text-sm">{thread.name}</p>
                <p className="text-xs text-gray-500 truncate">{thread.latest}</p>
              </div>
              {thread.unread > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2">{thread.unread}</span>
              )}
            </div>
          ))
        )}
      </aside>
      <section className="flex flex-col flex-1">
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {activeThread?.messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.from === 'store' ? 'justify-end' : 'justify-start'}`}>
              <div className={`rounded px-3 py-2 max-w-xs ${msg.from === 'store' ? 'bg-blue-100' : 'bg-gray-100'}`}>{msg.text}</div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="border-t p-3 flex items-end space-x-2">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="メッセージを入力"
            className="flex-1 border rounded p-2 resize-none"
            rows={2}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          />
          <button onClick={handleSend} className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700">送信</button>
        </div>
      </section>
    </main>
  )
}

