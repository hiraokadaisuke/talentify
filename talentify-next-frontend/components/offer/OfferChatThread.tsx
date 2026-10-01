'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
import { AlertCircle, MessageCircle, RotateCcw } from 'lucide-react'
import { MESSAGES_CHANGED_EVENT } from '@/utils/messages'

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
  const supabase = useMemo(() => createClient(), [])
  const [messages, setMessages] = useState<OfferMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [historyLoadError, setHistoryLoadError] = useState(false)
  const [readSyncError, setReadSyncError] = useState(false)
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
    try {
      const response = await fetch('/api/messages/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offerId }),
      })

      if (!response.ok) {
        throw new Error('failed to mark messages as read')
      }

      setUnreadCount(0)
      window.dispatchEvent(new Event(MESSAGES_CHANGED_EVENT))

      try {
        await upsertReadReceipt(supabase, offerId)
        await updateReadReceipts()
        setReadSyncError(false)
      } catch (receiptError) {
        console.error('failed to sync offer read receipt', receiptError)
        setReadSyncError(true)
      }
    } catch (error) {
      console.error('failed to mark offer conversation as read', error)
      setReadSyncError(true)
    }
  }, [offerId, supabase, updateReadReceipts])

  const loadInitial = useCallback(async () => {
    setLoading(true)
    setLoadError(false)
    setHistoryLoadError(false)

    try {
      const { data } = await listOfferMessages(supabase, offerId, { limit: 50 })
      const ordered = data.slice().reverse()

      setMessages(ordered)
      hasMoreRef.current = data.length === 50

      if (ordered.length > 0) {
        oldestRef.current = ordered[0].created_at
        setLastUpdatedAt(ordered[ordered.length - 1].created_at)
      } else {
        oldestRef.current = null
        setLastUpdatedAt(null)
      }

      try {
        const receipts = await getReadReceipts(supabase, offerId)
        const other = receipts.find(r => r.user_id !== currentUserId)
        const self = receipts.find(r => r.user_id === currentUserId)
        setPeerLastReadAt(other?.last_read_at ?? null)

        const lastRead = self?.last_read_at ?? null
        const unread = ordered.filter(message => {
          if (message.sender_user === currentUserId) return false
          if (!lastRead) return true
          return new Date(message.created_at) > new Date(lastRead)
        }).length
        setUnreadCount(unread)
      } catch (receiptError) {
        console.error('failed to load offer read receipts', receiptError)
        setReadSyncError(true)
      }

      requestAnimationFrame(scrollToBottom)
      void markConversationAsRead()
    } catch (error) {
      console.error('failed to load offer messages', error)
      setMessages([])
      setLoadError(true)
    } finally {
      setLoading(false)
    }
  }, [currentUserId, markConversationAsRead, offerId, supabase])

  const loadMore = async () => {
    if (!hasMoreRef.current || !oldestRef.current) return

    try {
      const { data } = await listOfferMessages(supabase, offerId, {
        before: oldestRef.current,
        limit: 50,
      })

      setHistoryLoadError(false)

      if (data.length === 0) {
        hasMoreRef.current = false
        return
      }

      oldestRef.current = data[data.length - 1].created_at
      if (data.length < 50) {
        hasMoreRef.current = false
      }

      setMessages(previous => {
        const existingIds = new Set(previous.map(message => message.id))
        return [
          ...data
            .slice()
            .reverse()
            .filter(message => !existingIds.has(message.id)),
          ...previous,
        ]
      })
    } catch (error) {
      console.error('failed to load older offer messages', error)
      setHistoryLoadError(true)
    }
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
      setMessages(prev =>
        prev.some(message => message.id === msg.id)
          ? prev
          : [...prev, msg],
      )
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
    setMessages(prev =>
      prev.some(message => message.id === msg.id)
        ? prev
        : [...prev, msg],
    )
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
        'flex h-full min-h-[360px] min-w-0 flex-col overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#FDFDFD] sm:min-h-[420px]',
        className,
      )}
    >
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-2 border-b border-[#E5E7EB] bg-white px-3 py-2.5 sm:px-4">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-4.5 w-4.5 text-slate-600" aria-hidden="true" />
          <h3 className="text-sm font-semibold text-slate-900">メッセージ</h3>
          {unreadCount > 0 && (
            <span className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-rose-500 px-1 text-xs font-semibold text-white">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {readSyncError && (
            <button
              type="button"
              onClick={() => void markConversationAsRead()}
              className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-700 underline sm:text-xs"
            >
              <RotateCcw className="h-3 w-3" aria-hidden="true" />
              既読状態を再同期
            </button>
          )}
          <span className="text-[10px] text-[#9CA3AF] sm:text-xs">最終更新: {formatTimestamp(lastUpdatedAt)}</span>
        </div>
      </div>
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto bg-[#F7F7F7] px-3 py-3"
        aria-live="polite"
      >
        {loading && (
          <p className="text-sm text-slate-500">メッセージを読み込んでいます…</p>
        )}
        {!loading && loadError && (
          <div
            role="alert"
            className="mx-auto mt-8 max-w-md rounded-xl border border-red-200 bg-red-50 px-4 py-5 text-center"
          >
            <AlertCircle className="mx-auto h-5 w-5 text-red-600" aria-hidden="true" />
            <p className="mt-2 text-sm font-semibold text-red-900">
              メッセージを読み込めませんでした
            </p>
            <p className="mt-1 text-xs leading-relaxed text-red-700">
              通信状況を確認して、もう一度お試しください。
            </p>
            <button
              type="button"
              onClick={() => void loadInitial()}
              className="mt-3 inline-flex min-h-9 items-center gap-1.5 rounded-md border border-red-200 bg-white px-3 text-xs font-semibold text-red-800 hover:bg-red-100"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              再読み込み
            </button>
          </div>
        )}
        {!loading && !loadError && historyLoadError && (
          <div className="mb-3 text-center">
            <button
              type="button"
              onClick={() => void loadMore()}
              className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 underline"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              過去のメッセージを再読み込み
            </button>
          </div>
        )}
        {!loading && !loadError && messages.length === 0 && (
          <p className="text-center text-sm leading-relaxed text-slate-500">
            このオファーに関する連絡はまだありません。下の入力欄からメッセージを送信しましょう。
          </p>
        )}
        {!loadError && <div className="flex flex-col gap-2.5">
          {messages.map((m, index) => {
            const prev = messages[index - 1]
            const showDateSeparator = !prev || formatDaySeparator(prev.created_at) !== formatDaySeparator(m.created_at)

            return (
              <div key={m.id} className="space-y-1.5">
                {showDateSeparator && (
                  <div className="my-1 text-center text-[11px] text-[#9CA3AF]">—— {formatDaySeparator(m.created_at)} ——</div>
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
        </div>}
      </div>
      <div className="border-t border-[#E5E7EB] bg-white px-3 py-3">
        {!loading && !loadError ? (
          <OfferChatInput
            offerId={offerId}
            senderRole={currentRole}
            receiverUserId={peerUserId}
            onSent={handleSent}
          />
        ) : (
          <p className="text-center text-xs text-slate-400">
            メッセージを確認できるまで送信欄は利用できません。
          </p>
        )}
      </div>
    </div>
  )
}
