'use client'

import { useState, KeyboardEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { sendOfferMessage } from '@/lib/supabase/offerMessages'
import { createClient } from '@/utils/supabase/client'

interface OfferChatInputProps {
  offerId: string
  senderRole: 'store' | 'talent' | 'admin'
  onSent?: (msg: any) => void
}

export default function OfferChatInput({ offerId, senderRole, onSent }: OfferChatInputProps) {
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const supabase = createClient()

  const handleSend = async () => {
    if (!body.trim()) return
    setSending(true)
    try {
      const message = await sendOfferMessage(supabase, {
        offerId,
        senderRole,
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
    <div className="space-y-3">
      <Textarea
        value={body}
        onChange={e => setBody(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="メッセージを入力..."
        rows={3}
        className="min-h-[96px] resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-inner"
      />
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
        <p>Enter + Shift で改行、Enter で送信</p>
        <Button
          onClick={handleSend}
          disabled={sending || !body.trim()}
          className="rounded-full bg-slate-800 px-6 text-white hover:bg-slate-700"
        >
          送信
        </Button>
      </div>
    </div>
  )
}
