'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
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
import { Button } from '@/components/ui/button'

interface OfferChatThreadProps {
  offerId: string
  currentUserId: string
  currentRole: 'store' | 'talent' | 'admin'
  paymentLink?: string
}
export default function OfferChatThread({
  offerId,
  currentUserId,
  currentRole,
  paymentLink,
}: OfferChatThreadProps) {
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
    setPeerLastReadAt(other?.last_read_at ?? null)
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
    <div className="flex h-full min-h-[520px] flex-col overflow-hidden rounded-xl border bg-card shadow-sm">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4"
        aria-live="polite"
      >
        {loading && <p>Loading...</p>}
        {!loading && messages.length === 0 && (
          <p className="text-center text-sm leading-relaxed text-muted-foreground">
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
      <div className="border-t bg-background p-4">
        <OfferChatInput offerId={offerId} senderRole={currentRole} onSent={handleSent} />
      </div>
      {paymentLink && (
        <div className="flex flex-wrap justify-end gap-2 border-t bg-muted/40 p-4">
          <Button variant="default" size="sm" asChild>
            <Link href={paymentLink}>支払い状況</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
