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
    if (!body) return
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
    <div className="border-t p-2 space-y-2">
      <Textarea
        value={body}
        onChange={e => setBody(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="メッセージを入力"
        rows={1}
      />
      <div className="flex justify-end">
        <Button onClick={handleSend} disabled={sending}>
          送信
        </Button>
      </div>
    </div>
  )
}
