'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import Image from 'next/image'
import { createClient } from '@/utils/supabase/client'
import { ListSkeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import OfferSummary, { OfferSummaryInfo } from './OfferSummary'
import { toast } from 'sonner'

const supabase = createClient()

export type UserRole = 'store' | 'talent'

type MessageRow = {
  id: string
  sender_user: string
  receiver_user: string
  body: string
  created_at: string | null
  offer_id: string | null
}

type ThreadMessage = {
  id: string
  from: UserRole
  text: string
  time: string | null
}

interface Thread {
  id: string
  partnerId: string
  name: string
  avatar: string
  latest: string
  unread: number
  updatedAt: string | null
  messages: ThreadMessage[]
}

function groupMessages(
  messages: MessageRow[],
  userId: string | null,
  role: UserRole,
  type: 'direct' | 'offer'
): Thread[] {
  const map = new Map<string, Thread>()
  for (const m of messages) {
    if (type === 'direct' && m.offer_id) continue
    if (type === 'offer' && !m.offer_id) continue
    const key = type === 'offer' ? m.offer_id! : m.sender_user === userId ? m.receiver_user : m.sender_user
    const partner = m.sender_user === userId ? m.receiver_user : m.sender_user
    if (!map.has(key)) {
      map.set(key, {
        id: key,
        partnerId: partner,
        name: type === 'offer' ? `Offer ${key.slice(0, 8)}` : `User ${partner.slice(0, 8)}`,
        avatar: '/avatar-default.svg',
        latest: m.body,
        unread: 0,
        updatedAt: m.created_at,
        messages: []
      })
    }
    const th = map.get(key)!
    th.messages.push({
      id: m.id,
      from: m.sender_user === userId ? role : role === 'store' ? 'talent' : 'store',
      text: m.body,
      time: m.created_at
    })
    if (th.updatedAt && m.created_at && new Date(th.updatedAt) < new Date(m.created_at)) {
      th.updatedAt = m.created_at
      th.latest = m.body
    }
  }
  return Array.from(map.values())
}

export default function MessagesPage({ role, type }: { role: UserRole; type: 'direct' | 'offer' }) {
  const [messages, setMessages] = useState<MessageRow[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const [offerInfo, setOfferInfo] = useState<OfferSummaryInfo | null>(null)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) setUserId(user.id)

      try {
        const res = await fetch(`/api/messages/inbox?type=${type}`)
        if (res.ok) {
          const { data }: { data: MessageRow[] } = await res.json()
          setMessages(data)
        } else {
          setMessages([])
        }
      } catch (e) {
        console.error(e)
        setMessages([])
      }
      setLoading(false)
    }
    init()
  }, [type])

  useEffect(() => {
    if (!userId) return
    const channel = supabase
      .channel('public:offer_messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'offer_messages' }, payload => {
        const m = payload.new as MessageRow
        if (m.sender_user === userId || m.receiver_user === userId) {
          if (type === 'direct' && m.offer_id) return
          if (type === 'offer' && !m.offer_id) return
          setMessages(prev => [...prev, m])
        }
      })
    channel.subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, type])

  const threads = useMemo(() => groupMessages(messages, userId, role, type), [messages, userId, role, type])

  useEffect(() => {
    if (!threads.length) {
      setActiveId(null)
      return
    }
    if (!activeId || !threads.find(t => t.id === activeId)) {
      setActiveId(threads[0].id)
    }
  }, [threads, activeId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeId, messages])

  useEffect(() => {
    if (type !== 'offer' || !activeId) {
      setOfferInfo(null)
      return
    }
    const fetchOffer = async () => {
      try {
        const res = await fetch(`/api/offers/${activeId}`)
        if (res.ok) {
          const { data } = await res.json()
          setOfferInfo({
            status: data.status,
            date: data.date ?? data.event_date ?? null,
            reward: data.reward ?? data.fee ?? null,
            location: data.location ?? null,
          })
        } else {
          setOfferInfo(null)
        }
      } catch (err) {
        console.error(err)
        setOfferInfo(null)
      }
    }
    fetchOffer()
  }, [type, activeId])

  const activeThread = threads.find(t => t.id === activeId)

  const handleSend = async () => {
    if (!input || !activeThread) return
    const tempId = `temp-${Date.now()}`
    const newMsg: MessageRow = {
      id: tempId,
      sender_user: userId || '',
      receiver_user: activeThread.partnerId,
      body: input,
      created_at: new Date().toISOString(),
      offer_id: type === 'offer' ? activeThread.id : null,
    }
    setMessages(prev => [...prev, newMsg])
    setInput('')

    try {
      const res = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverUser: activeThread.partnerId,
          body: newMsg.body,
          ...(type === 'offer' ? { offerId: activeThread.id } : {}),
        }),
      })
      if (!res.ok) throw new Error('failed')
      const { data }: { data: MessageRow } = await res.json()
      setMessages(prev => prev.map(m => (m.id === tempId ? data : m)))
    } catch (err) {
      setMessages(prev => prev.filter(m => m.id !== tempId))
      toast.error('送信に失敗しました')
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
              <div key={thread.id} className={`flex items-center px-4 py-3 cursor-pointer hover:bg-gray-50 ${activeId === thread.id ? 'bg-gray-100' : ''}`} onClick={() => setActiveId(thread.id)}>
              <Image src={thread.avatar} alt="avatar" width={40} height={40} className="rounded-full mr-3" />
              <div className="flex-1">
                <p className="font-semibold text-sm">{thread.name}</p>
                <p className="text-xs text-gray-500 truncate">{thread.latest}</p>
              </div>
              <div className="text-xs text-gray-400 ml-2 whitespace-nowrap">
                {thread.updatedAt && new Date(thread.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              {thread.unread > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2">{thread.unread}</span>
              )}
            </div>
          ))
        )}
      </aside>
      <section className="flex flex-col flex-1">
        {type === 'offer' && <OfferSummary offer={offerInfo} />}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {activeThread?.messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.from === role ? 'justify-end' : 'justify-start'}`}>
              <div className={`rounded px-3 py-2 max-w-xs ${msg.from === role ? 'bg-blue-100' : 'bg-gray-100'}`}>{msg.text}</div>
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
