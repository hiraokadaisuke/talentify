'use client'

import { useState, KeyboardEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { uploadAttachment } from '@/lib/supabase/storage'
import { sendOfferMessage, Attachment } from '@/lib/supabase/offerMessages'
import { createClient } from '@/utils/supabase/client'

interface OfferChatInputProps {
  offerId: string
  senderRole: 'store' | 'talent' | 'admin'
  onSent?: (msg: any) => void
}

export default function OfferChatInput({ offerId, senderRole, onSent }: OfferChatInputProps) {
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const supabase = createClient()

  const handleSend = async () => {
    if (!body && files.length === 0) return
    setSending(true)
    let attachments: Attachment[] = []
    try {
      for (const file of files) {
        const uploaded = await uploadAttachment(supabase, file)
        attachments.push(uploaded)
      }
      const message = await sendOfferMessage(supabase, {
        offerId,
        senderRole,
        body: body.trim() || null,
        attachments,
      })
      setBody('')
      setFiles([])
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
      <div className="flex items-center justify-between">
        <input
          type="file"
          multiple
          onChange={e => setFiles(Array.from(e.target.files || []))}
        />
        <Button onClick={handleSend} disabled={sending}>
          送信
        </Button>
      </div>
    </div>
  )
}
