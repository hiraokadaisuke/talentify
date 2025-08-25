'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { OfferMessage } from '@/lib/supabase/offerMessages'
import {
  listOfferMessages,
  subscribeOfferMessages,
  upsertReadReceipt,
  getReadReceipts,
} from '@/lib/supabase/offerMessages'
import ChatMessageBubble from './ChatMessageBubble'
import OfferChatInput from './OfferChatInput'

interface OfferChatThreadProps {
  offerId: string
  currentUserId: string
  currentRole: 'store' | 'talent' | 'admin'
}

export default function OfferChatThread({ offerId, currentUserId, currentRole }: OfferChatThreadProps) {
  const supabase = createClient()
  const [messages, setMessages] = useState<OfferMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [peerLastReadAt, setPeerLastReadAt] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const oldestRef = useRef<string | null>(null)
  const hasMoreRef = useRef(true)

  const scrollToBottom = () => {
    const el = containerRef.current
    if (el) el.scrollTop = el.scrollHeight
  }

  const updatePeerRead = async () => {
    const receipts = await getReadReceipts(supabase, offerId)
    const other = receipts.find(r => r.user_id !== currentUserId)
    setPeerLastReadAt(other?.read_at ?? null)
  }

  const loadInitial = async () => {
    const { data } = await listOfferMessages(supabase, offerId, { limit: 50 })
    setMessages(data.reverse())
    if (data.length > 0) oldestRef.current = data[data.length - 1].created_at
    setLoading(false)
    scrollToBottom()
    await upsertReadReceipt(supabase, offerId)
    updatePeerRead()
  }

  const loadMore = async () => {
    if (!hasMoreRef.current || !oldestRef.current) return
    const { data } = await listOfferMessages(supabase, offerId, {
      before: oldestRef.current,
      limit: 50,
    })
    if (data.length === 0) {
      hasMoreRef.current = false
      return
    }
    oldestRef.current = data[data.length - 1].created_at
    setMessages(prev => [...data.reverse(), ...prev])
  }

  const handleScroll = async () => {
    const el = containerRef.current
    if (el && el.scrollTop === 0) {
      await loadMore()
    }
  }

  useEffect(() => {
    loadInitial()
    const channel = subscribeOfferMessages(supabase, offerId, msg => {
      if (msg.sender_user === currentUserId) return
      setMessages(prev => [...prev, msg])
      scrollToBottom()
      updatePeerRead()
    })
    const onFocus = () => upsertReadReceipt(supabase, offerId)
    window.addEventListener('focus', onFocus)
    return () => {
      channel.unsubscribe()
      window.removeEventListener('focus', onFocus)
    }
  }, [offerId])

  const handleSent = (msg: OfferMessage) => {
    setMessages(prev => [...prev, msg])
    scrollToBottom()
    updatePeerRead()
  }

  return (
    <div className="flex flex-col h-full border rounded">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-2"
        aria-live="polite"
      >
        {loading && <p>Loading...</p>}
        {!loading && messages.length === 0 && (
          <p className="text-sm text-center text-muted-foreground">
            このオファーに関する連絡はまだありません。下の入力欄からメッセージを送信しましょう。
          </p>
        )}
        {messages.map(m => (
          <ChatMessageBubble
            key={m.id}
            message={m}
            currentUserId={currentUserId}
            peerLastReadAt={peerLastReadAt}
          />
        ))}
      </div>
      <OfferChatInput offerId={offerId} senderRole={currentRole} onSent={handleSent} />
    </div>
  )
}
