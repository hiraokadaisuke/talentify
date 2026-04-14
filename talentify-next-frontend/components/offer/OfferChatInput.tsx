'use client'

import { useState, KeyboardEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { sendOfferMessage } from '@/lib/supabase/offerMessages'
import { createClient } from '@/utils/supabase/client'

interface OfferChatInputProps {
  offerId: string
  senderRole: 'store' | 'talent' | 'admin'
  receiverUserId: string
  onSent?: (msg: any) => void
}

export default function OfferChatInput({ offerId, senderRole, receiverUserId, onSent }: OfferChatInputProps) {
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const supabase = createClient()

  const handleSend = async () => {
    if (!body.trim() || !receiverUserId) return
    setSending(true)
    try {
      const message = await sendOfferMessage(supabase, {
        offerId,
        senderRole,
        receiverUserId,
        body: body.trim() || null,
        attachments: [],
      })
      setBody('')
      onSent?.(message)
    } finally {
      setSending(false)
    }
  }

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
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
      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
        <p>{receiverUserId ? 'Shift + Enter で改行 / Enter で送信' : '送信先ユーザー情報を読み込み中です。'}</p>
        <Button
          onClick={handleSend}
          disabled={sending || !body.trim() || !receiverUserId}
          className="rounded-full bg-emerald-500 px-5 text-white transition hover:bg-emerald-600 disabled:bg-slate-300"
        >
          {sending ? '送信中...' : '送信'}
        </Button>
      </div>
    </div>
  )
}
