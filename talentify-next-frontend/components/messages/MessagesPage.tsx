'use client'

import Link from 'next/link'
import { useCallback, useState, useEffect, useRef, useMemo } from 'react'
import Image from 'next/image'
import { AlertCircle, Search, ChevronLeft, RotateCcw } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { ListSkeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import OfferSummary, { OfferSummaryInfo } from './OfferSummary'
import { toast } from 'sonner'
import type { Attachment } from '@/lib/supabase/offerMessages'
import { SecureMessageAttachment } from '@/components/offer/ChatMessageBubble'
import { MESSAGES_CHANGED_EVENT } from '@/utils/messages'

const supabase = createClient()

export type UserRole = 'store' | 'talent'

type MessageRow = {
  id: string
  sender_user: string
  receiver_user: string
  body: string | null
  created_at: string | null
  offer_id: string | null
  read_at?: string | null
  attachments?: Attachment[] | null
}

type ThreadMessage = {
  id: string
  from: UserRole
  text: string
  time: string | null
  attachments: Attachment[]
}

interface Thread {
  id: string
  partnerId: string
  name: string
  avatar: string
  latest: string
  unread: number
  updatedAt: string | null
  statusLabel: string
  messages: ThreadMessage[]
}

function formatTime(value: string | null) {
  if (!value) return '--:--'
  return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function formatDateLabel(value: string | null) {
  if (!value) return ''
  return new Date(value).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    weekday: 'short',
  })
}

function messagePreviewText(message: MessageRow) {
  const body = message.body?.trim()
  if (body) return body

  const attachments = message.attachments ?? []
  if (attachments.length === 1) {
    return `添付: ${attachments[0].name}`
  }
  if (attachments.length > 1) {
    return `添付ファイル ${attachments.length}件`
  }

  return 'メッセージ'
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
        name: type === 'offer' ? `オファー ${key.slice(0, 8)}` : `ユーザー ${partner.slice(0, 8)}`,
        avatar: '/avatar-default.svg',
        latest: messagePreviewText(m),
        unread: 0,
        updatedAt: m.created_at,
        statusLabel: type === 'offer' ? 'オファー中' : '進行中',
        messages: []
      })
    }
    const th = map.get(key)!
    if (m.receiver_user === userId && !m.read_at) {
      th.unread += 1
    }
    th.messages.push({
      id: m.id,
      from: m.sender_user === userId ? role : role === 'store' ? 'talent' : 'store',
      text: m.body ?? '',
      time: m.created_at,
      attachments: m.attachments ?? [],
    })
    if (th.updatedAt && m.created_at && new Date(th.updatedAt) < new Date(m.created_at)) {
      th.updatedAt = m.created_at
      th.latest = messagePreviewText(m)
    }
  }
  return Array.from(map.values()).map(thread => ({
    ...thread,
    messages: thread.messages.sort((a, b) => new Date(a.time ?? 0).getTime() - new Date(b.time ?? 0).getTime())
  }))
}

export default function MessagesPage({
  role,
  type,
  basePath,
  initialPartnerId,
}: {
  role: UserRole
  type: 'direct' | 'offer'
  basePath?: string
  initialPartnerId?: string | null
}) {
  const [messages, setMessages] = useState<MessageRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const [query, setQuery] = useState('')
  const [offerInfo, setOfferInfo] = useState<OfferSummaryInfo | null>(null)
  const [sending, setSending] = useState(false)
  const [readSyncError, setReadSyncError] = useState(false)
  const [mobileThreadOpen, setMobileThreadOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const loadMessages = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        throw authError ?? new Error('Authenticated user not found')
      }

      setUserId(user.id)

      const res = await fetch(`/api/messages/inbox?type=${type}`)
      if (!res.ok) {
        throw new Error('failed to fetch messages')
      }

      const payload = (await res.json()) as { data?: MessageRow[] }
      setMessages(Array.isArray(payload.data) ? payload.data : [])
    } catch (loadError) {
      console.error('failed to load messages', loadError)
      setError('メッセージを読み込めませんでした')
      setMessages([])
    } finally {
      setLoading(false)
    }
  }, [type])

  useEffect(() => {
    void loadMessages()
  }, [loadMessages])

  useEffect(() => {
    if (!userId) return
    const channel = supabase
      .channel(`public:offer_messages:${type}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'offer_messages' }, payload => {
        const m = payload.new as MessageRow
        if (m.sender_user === userId || m.receiver_user === userId) {
          if (type === 'direct' && m.offer_id) return
          if (type === 'offer' && !m.offer_id) return
          setMessages(prev =>
            prev.some(message => message.id === m.id)
              ? prev
              : [...prev, m],
          )
        }
      })
    channel.subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, type])

  const threads = useMemo(() => {
    const grouped = groupMessages(messages, userId, role, type)
    if (
      type === 'direct' &&
      initialPartnerId &&
      !grouped.some(thread => thread.id === initialPartnerId)
    ) {
      grouped.unshift({
        id: initialPartnerId,
        partnerId: initialPartnerId,
        name: '新規メッセージ',
        avatar: '/avatar-default.svg',
        latest: 'まだメッセージはありません',
        unread: 0,
        updatedAt: null,
        statusLabel: '新規',
        messages: [],
      })
    }
    return grouped
  }, [messages, userId, role, type, initialPartnerId])

  const filteredThreads = useMemo(() => {
    if (!query.trim()) return threads
    const keyword = query.toLowerCase()
    return threads.filter(thread => thread.name.toLowerCase().includes(keyword) || thread.latest.toLowerCase().includes(keyword))
  }, [threads, query])

  useEffect(() => {
    if (!filteredThreads.length) {
      setActiveId(null)
      return
    }
    if (!activeId || !filteredThreads.find(t => t.id === activeId)) {
      setActiveId(filteredThreads[0].id)
    }
  }, [filteredThreads, activeId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeId, messages])

  useEffect(() => {
    if (type === 'direct' && initialPartnerId) {
      setActiveId(initialPartnerId)
      setMobileThreadOpen(true)
    }
  }, [type, initialPartnerId])

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
            time: data.time_range ?? data.start_time ?? data.time ?? null,
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

  const activeThread = filteredThreads.find(t => t.id === activeId)

  const markThreadRead = useCallback(async (thread: Thread) => {
    if (!userId || thread.unread <= 0) return

    const payload =
      type === 'offer'
        ? { offerId: thread.id }
        : { withUser: thread.partnerId }

    try {
      const res = await fetch('/api/messages/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        throw new Error('failed to mark message thread as read')
      }

      setReadSyncError(false)
      const now = new Date().toISOString()
      setMessages(prev =>
        prev.map(message => {
          const belongsToThread =
            type === 'offer'
              ? message.offer_id === thread.id
              : !message.offer_id &&
                (message.sender_user === thread.partnerId || message.receiver_user === thread.partnerId)
          return belongsToThread && message.receiver_user === userId && !message.read_at
            ? { ...message, read_at: now }
            : message
        }),
      )
      window.dispatchEvent(new Event(MESSAGES_CHANGED_EVENT))
    } catch (markError) {
      console.error('failed to mark message thread as read', markError)
      setReadSyncError(true)
    }
  }, [type, userId])

  useEffect(() => {
    if (!activeThread || !userId) return

    const visible =
      mobileThreadOpen ||
      window.matchMedia('(min-width: 768px)').matches

    if (visible && activeThread.unread > 0) {
      void markThreadRead(activeThread)
    }
  }, [
    activeId,
    activeThread?.unread,
    markThreadRead,
    mobileThreadOpen,
    userId,
  ])

  const handleSend = async () => {
    const messageBody = input.trim()
    if (!messageBody || !activeThread || !userId || sending) return

    setSending(true)

    try {
      const res = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverUserId: activeThread.partnerId,
          body: messageBody,
          ...(type === 'offer' ? { offerId: activeThread.id } : {}),
        }),
      })

      const payload = (await res.json().catch(() => null)) as {
        data?: MessageRow
        error?: string
      } | null

      if (!res.ok || !payload?.data) {
        throw new Error(payload?.error ?? 'message_send_failed')
      }

      setMessages(prev =>
        prev.some(message => message.id === payload.data!.id)
          ? prev
          : [...prev, payload.data!],
      )
      setInput('')
    } catch (sendError) {
      console.error('failed to send message', sendError)
      toast.error('送信に失敗しました。入力内容は残っています。')
    } finally {
      setSending(false)
    }
  }

  const groupedMessages = useMemo(() => {
    if (!activeThread) return [] as Array<{ date: string; items: ThreadMessage[] }>
    const map = new Map<string, ThreadMessage[]>()
    activeThread.messages.forEach(message => {
      const key = message.time ? new Date(message.time).toDateString() : 'unknown'
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(message)
    })
    return Array.from(map.entries()).map(([date, items]) => ({ date, items }))
  }, [activeThread])

  return (
    <main className="bg-gray-100 px-2 pb-4 md:px-4">
      <div className="mx-auto w-full max-w-7xl">
        <div className="h-[calc(100vh-9rem)] min-h-[560px] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex h-full">
            <aside className={`${mobileThreadOpen ? 'hidden' : 'flex'} w-full flex-col border-r border-gray-200 md:flex md:w-80 md:min-w-80`}>
              <div className="border-b border-gray-200 p-4 space-y-3">
                <h2 className="text-lg font-semibold text-gray-900">メッセージ一覧</h2>
                {basePath && (
                  <div className="flex rounded-xl bg-gray-100 p-1 text-sm">
                    <Link href={`${basePath}?tab=direct`} className={`flex-1 rounded-lg px-3 py-2 text-center ${type === 'direct' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'}`}>
                      直通
                    </Link>
                    <Link href={`${basePath}?tab=offer`} className={`flex-1 rounded-lg px-3 py-2 text-center ${type === 'offer' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'}`}>
                      オファー
                    </Link>
                  </div>
                )}
                <label className="flex items-center rounded-xl border border-gray-200 bg-white px-3 py-2">
                  <Search className="mr-2 h-4 w-4 text-gray-400" />
                  <input
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="相手名・メッセージを検索"
                    className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
                  />
                </label>
              </div>

              <div className="flex-1 overflow-y-auto bg-gray-50/40 p-2">
                {loading ? (
                  <ListSkeleton count={6} className="p-3" />
                ) : error ? (
                  <div
                    role="alert"
                    className="m-2 rounded-xl border border-red-200 bg-red-50 px-4 py-5 text-center"
                  >
                    <AlertCircle className="mx-auto h-5 w-5 text-red-600" aria-hidden="true" />
                    <p className="mt-2 text-sm font-semibold text-red-900">{error}</p>
                    <p className="mt-1 text-xs text-red-700">
                      通信状況を確認して、もう一度お試しください。
                    </p>
                    <button
                      type="button"
                      onClick={() => void loadMessages()}
                      className="mt-3 inline-flex min-h-9 items-center gap-1.5 rounded-md border border-red-200 bg-white px-3 text-xs font-semibold text-red-800 hover:bg-red-100"
                    >
                      <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                      再読み込み
                    </button>
                  </div>
                ) : filteredThreads.length === 0 ? (
                  <EmptyState title="スレッドがありません" description="メッセージが届くとここに表示されます" className="p-4" />
                ) : (
                  filteredThreads
                    .sort((a, b) => {
                      const aTime = a.updatedAt ? new Date(a.updatedAt).getTime() : 0
                      const bTime = b.updatedAt ? new Date(b.updatedAt).getTime() : 0
                      return bTime - aTime
                    })
                    .map(thread => (
                      <button
                        key={thread.id}
                        type="button"
                        className={`mb-2 w-full rounded-xl border px-3 py-3 text-left transition ${activeId === thread.id ? 'border-blue-200 bg-blue-50 shadow-sm' : 'border-transparent bg-white hover:border-gray-200 hover:bg-gray-50'}`}
                        onClick={() => {
                          setActiveId(thread.id)
                          setMobileThreadOpen(true)
                          void markThreadRead(thread)
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <Image src={thread.avatar} alt="avatar" width={40} height={40} className="rounded-full border border-gray-200" />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <p className="truncate text-sm font-semibold text-gray-900">{thread.name}</p>
                              <span className="shrink-0 text-xs text-gray-400">{formatTime(thread.updatedAt)}</span>
                            </div>
                            <p className="truncate text-xs text-gray-500">{thread.latest}</p>
                            <div className="mt-2 flex items-center gap-2">
                              <span className="rounded-full bg-gray-100 px-2 py-1 text-[11px] text-gray-600">{thread.statusLabel}</span>
                              {thread.unread > 0 && <span className="rounded-full bg-red-500 px-2 py-0.5 text-[11px] text-white">{thread.unread}</span>}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))
                )}
              </div>
            </aside>

            <section className={`${mobileThreadOpen ? 'flex' : 'hidden'} min-w-0 flex-1 flex-col md:flex`}>
              <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
                <div className="min-w-0">
                  <div className="mb-1 flex items-center gap-2">
                    <button type="button" className="rounded-md p-1 text-gray-500 hover:bg-gray-100 md:hidden" onClick={() => setMobileThreadOpen(false)}>
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <h3 className="truncate text-base font-semibold text-gray-900">{activeThread?.name ?? (type === 'offer' ? 'オファー詳細' : 'メッセージ')}</h3>
                  </div>
                  <p className="truncate text-xs text-gray-500">
                    {type === 'offer' ? `ステータス: ${offerInfo?.status ?? '確認中'} / 最終返信: ${activeThread ? formatTime(activeThread.updatedAt) : '--:--'}` : `最終返信: ${activeThread ? formatTime(activeThread.updatedAt) : '--:--'}`}
                  </p>
                  {readSyncError && activeThread?.unread ? (
                    <button
                      type="button"
                      onClick={() => void markThreadRead(activeThread)}
                      className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 underline"
                    >
                      <RotateCcw className="h-3 w-3" aria-hidden="true" />
                      既読状態を再同期
                    </button>
                  ) : null}
                </div>
                {type === 'offer' && activeId && (
                  <Link
                    href={`/${role}/offers/${activeId}`}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
                  >
                    オファー内容を見る
                  </Link>
                )}
              </header>

              {type === 'offer' && (
                <div className="border-b border-gray-200 bg-white px-4 py-3">
                  <OfferSummary offer={offerInfo} role={role} offerId={activeId} />
                </div>
              )}

              <div className="flex-1 overflow-y-auto bg-gray-100/70 p-4">
                {!activeThread ? (
                  <EmptyState title="会話を選択してください" description="左のメッセージ一覧からスレッドを選ぶと会話が表示されます" className="mx-auto mt-16 max-w-md" />
                ) : groupedMessages.length === 0 ? (
                  <EmptyState title="まだメッセージはありません" description="日程や条件について相談してみましょう。" className="mx-auto mt-16 max-w-md" />
                ) : (
                  groupedMessages.map(group => (
                    <div key={group.date} className="mb-5">
                      <div className="mb-4 text-center">
                        <span className="rounded-full bg-white px-3 py-1 text-xs text-gray-500 shadow-sm">{formatDateLabel(group.items[0]?.time ?? null)}</span>
                      </div>
                      <div className="space-y-3">
                        {group.items.map(msg => (
                          <div key={msg.id} className={`flex ${msg.from === role ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm shadow-sm md:max-w-xl ${msg.from === role ? 'rounded-br-md bg-blue-100 text-gray-800' : 'rounded-bl-md border border-gray-200 bg-white text-gray-800'}`}>
                              <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                              {type === 'offer' &&
                                msg.attachments.map(attachment => (
                                  <SecureMessageAttachment
                                    key={attachment.path}
                                    messageId={msg.id}
                                    attachment={attachment}
                                    isMine={msg.from === role}
                                  />
                                ))}
                              <p className="mt-1 text-right text-[11px] text-gray-400">{formatTime(msg.time)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="border-t border-gray-200 bg-white p-3">
                <div className="flex items-end gap-2 rounded-2xl border border-gray-200 bg-white p-2">
                  <textarea
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="メッセージを入力"
                    className="max-h-36 min-h-[40px] flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none placeholder:text-gray-400"
                    rows={1}
                    disabled={sending}
                    maxLength={5000}
                    onKeyDown={e => {
                      if (e.nativeEvent.isComposing) return
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        void handleSend()
                      }
                    }}
                  />
                  <div className="shrink-0 text-[10px] text-gray-400">
                    {input.length}/5000
                  </div>
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={!input.trim() || !activeThread || sending}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                  >
                    {sending ? '送信中...' : '送信'}
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}
