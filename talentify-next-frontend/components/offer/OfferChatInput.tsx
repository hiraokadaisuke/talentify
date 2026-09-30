'use client'

import { useState, KeyboardEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import type { OfferMessage } from '@/lib/supabase/offerMessages'
import { toast } from 'sonner'

interface OfferChatInputProps {
  offerId: string
  senderRole: 'store' | 'talent' | 'admin'
  receiverUserId: string
  onSent?: (msg: OfferMessage) => void
}

export default function OfferChatInput({ offerId, receiverUserId, onSent }: OfferChatInputProps) {
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)

  const handleSend = async () => {
    const messageBody = body.trim()
    if (!messageBody || !receiverUserId || sending) return
    setSending(true)

    try {
      const res = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverUserId,
          offerId,
          body: messageBody,
        }),
      })
      const payload = await res.json().catch(() => null)
      if (!res.ok || !payload?.data) {
        throw new Error(payload?.error ?? 'send_failed')
      }

      setBody('')
      onSent?.(payload.data as OfferMessage)
    } catch (error) {
      console.error('failed to send offer message', error)
      toast.error('メッセージの送信に失敗しました')
    } finally {
      setSending(false)
    }
  }

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void handleSend()
    }
  }

  return (
    <div className="space-y-2.5">
      <Textarea
        value={body}
        onChange={e => setBody(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="メッセージを入力"
        rows={2}
        className="min-h-[72px] resize-none rounded-3xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm focus-visible:border-emerald-400 focus-visible:ring-emerald-200"
      />
      <div className="flex flex-col gap-2 text-[11px] text-slate-400 sm:flex-row sm:items-center sm:justify-between">
        <p>{receiverUserId ? 'Shift + Enter で改行 / Enter で送信' : '送信先ユーザー情報を読み込み中です。'}</p>
        <Button
          onClick={() => void handleSend()}
          disabled={sending || !body.trim() || !receiverUserId}
          className="min-h-11 w-full rounded-full bg-emerald-500 px-5 text-white transition hover:bg-emerald-600 disabled:bg-slate-300 sm:w-auto"
        >
          {sending ? '送信中...' : '送信'}
        </Button>
      </div>
    </div>
  )
}
