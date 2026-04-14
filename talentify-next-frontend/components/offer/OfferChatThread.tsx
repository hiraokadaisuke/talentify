'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
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
import { format } from 'date-fns'
import { MessageCircle } from 'lucide-react'

interface OfferChatThreadProps {
  offerId: string
  currentUserId: string
  peerUserId: string
  currentRole: 'store' | 'talent' | 'admin'
  storeName: string
  talentName: string
  adminName?: string
  className?: string
}
export default function OfferChatThread({
  offerId,
  currentUserId,
  peerUserId,
  currentRole,
  storeName,
  talentName,
  adminName = 'サポート',
  className,
}: OfferChatThreadProps) {
  const supabase = createClient()
  const [messages, setMessages] = useState<OfferMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [peerLastReadAt, setPeerLastReadAt] = useState<string | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const oldestRef = useRef<string | null>(null)
  const hasMoreRef = useRef(true)

  const scrollToBottom = () => {
    const el = containerRef.current
    if (el) el.scrollTop = el.scrollHeight
  }

  const updateReadReceipts = useCallback(async () => {
    const receipts = await getReadReceipts(supabase, offerId)
    const other = receipts.find(r => r.user_id !== currentUserId)
    setPeerLastReadAt(other?.last_read_at ?? null)
  }, [currentUserId, offerId, supabase])

  const markConversationAsRead = useCallback(async () => {
    await upsertReadReceipt(supabase, offerId)
    setUnreadCount(0)
    await updateReadReceipts()
  }, [offerId, supabase, updateReadReceipts])

  const loadInitial = useCallback(async () => {
    const { data } = await listOfferMessages(supabase, offerId, { limit: 50 })
    const ordered = data.slice().reverse()
    setMessages(ordered)
    hasMoreRef.current = true
    if (ordered.length > 0) {
      oldestRef.current = ordered[0].created_at
      setLastUpdatedAt(ordered[ordered.length - 1].created_at)
    } else {
      oldestRef.current = null
      setLastUpdatedAt(null)
    }
    setLoading(false)
    scrollToBottom()
    const receipts = await getReadReceipts(supabase, offerId)
    const other = receipts.find(r => r.user_id !== currentUserId)
    const self = receipts.find(r => r.user_id === currentUserId)
    setPeerLastReadAt(other?.last_read_at ?? null)
    const lastRead = self?.last_read_at ?? null
    const unread = ordered.filter(m => {
      if (m.sender_user === currentUserId) return false
      if (!lastRead) return true
      return new Date(m.created_at) > new Date(lastRead)
    }).length
    setUnreadCount(unread)
    await markConversationAsRead()
  }, [currentUserId, markConversationAsRead, offerId, supabase])

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
    void loadInitial()
    const channel = subscribeOfferMessages(supabase, offerId, msg => {
      if (msg.sender_user === currentUserId) return
      setMessages(prev => [...prev, msg])
      scrollToBottom()
      setLastUpdatedAt(msg.created_at)
      if (document.hasFocus()) {
        void markConversationAsRead()
      } else {
        setUnreadCount(prev => prev + 1)
        void updateReadReceipts()
      }
    })
    const onFocus = () => {
      void markConversationAsRead()
    }
    window.addEventListener('focus', onFocus)
    return () => {
      channel.unsubscribe()
      window.removeEventListener('focus', onFocus)
    }
  }, [currentUserId, loadInitial, markConversationAsRead, offerId, supabase, updateReadReceipts])

  const handleSent = (msg: OfferMessage) => {
    setMessages(prev => [...prev, msg])
    scrollToBottom()
    setLastUpdatedAt(msg.created_at)
    void markConversationAsRead()
  }

  useEffect(() => {
    if (messages.length === 0) return
    setLastUpdatedAt(messages[messages.length - 1].created_at)
  }, [messages])

  const formatTimestamp = (iso: string | null) => {
    if (!iso) return '-'
    try {
      return format(new Date(iso), 'yyyy/MM/dd HH:mm')
    } catch {
      return '-'
    }
  }

  const formatDaySeparator = (iso: string) => {
    try {
      return format(new Date(iso), 'yyyy/MM/dd')
    } catch {
      return ''
    }
  }

  const resolveSenderName = (message: OfferMessage) => {
    switch (message.sender_role) {
      case 'store':
        return storeName || '店舗'
      case 'talent':
        return talentName || '演者'
      case 'admin':
        return adminName
      default:
        return 'ユーザー'
    }
  }

  return (
    <div
      className={cn(
        'flex h-full min-h-[420px] flex-col overflow-hidden rounded-xl border border-slate-200 bg-slate-50/40',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b border-slate-200/80 bg-white/85 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-4.5 w-4.5 text-slate-600" aria-hidden="true" />
          <h3 className="text-sm font-semibold text-slate-900">メッセージ</h3>
          {unreadCount > 0 && (
            <span className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-rose-500 px-1 text-xs font-semibold text-white">
              {unreadCount}
            </span>
          )}
        </div>
        <span className="text-[10px] text-slate-400 sm:text-xs">最終更新: {formatTimestamp(lastUpdatedAt)}</span>
      </div>
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto bg-[#f7f8fa] px-3 py-3"
        aria-live="polite"
      >
        {loading && <p className="text-sm text-slate-500">Loading...</p>}
        {!loading && messages.length === 0 && (
          <p className="text-center text-sm leading-relaxed text-slate-500">
            このオファーに関する連絡はまだありません。下の入力欄からメッセージを送信しましょう。
          </p>
        )}
        <div className="flex flex-col gap-2.5">
          {messages.map((m, index) => {
            const prev = messages[index - 1]
            const showDateSeparator = !prev || formatDaySeparator(prev.created_at) !== formatDaySeparator(m.created_at)

            return (
              <div key={m.id} className="space-y-1.5">
                {showDateSeparator && (
                  <div className="my-1 text-center text-[11px] text-slate-400">—— {formatDaySeparator(m.created_at)} ——</div>
                )}
                <ChatMessageBubble
                  message={m}
                  currentUserId={currentUserId}
                  peerLastReadAt={peerLastReadAt}
                  senderName={resolveSenderName(m)}
                />
              </div>
            )
          })}
        </div>
      </div>
      <div className="border-t border-slate-200 bg-white px-3 py-3">
        <OfferChatInput offerId={offerId} senderRole={currentRole} receiverUserId={peerUserId} onSent={handleSent} />
      </div>
    </div>
  )
}
