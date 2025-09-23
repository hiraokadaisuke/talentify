'use client'

import { createClient } from '@/utils/supabase/client'
import type { OfferMessage } from '@/lib/supabase/offerMessages'
import { clsx } from 'clsx'
import { format } from 'date-fns'

interface ChatMessageBubbleProps {
  message: OfferMessage
  currentUserId: string
  peerLastReadAt?: string | null
}

export default function ChatMessageBubble({
  message,
  currentUserId,
  peerLastReadAt,
}: ChatMessageBubbleProps) {
  const isMine = message.sender_user === currentUserId
  const supabase = createClient()
  const time = format(new Date(message.created_at), 'HH:mm')
  const read = isMine && peerLastReadAt && new Date(peerLastReadAt) >= new Date(message.created_at)

  return (
    <div className={clsx('mb-3 flex', isMine ? 'justify-end' : 'justify-start')}>
      <div
        className={clsx(
          'max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-md',
          isMine ? 'bg-primary text-primary-foreground' : 'bg-muted'
        )}
      >
        {message.body && <p className="whitespace-pre-wrap break-words">{message.body}</p>}
        {message.attachments?.map(att => {
          const { data } = supabase.storage.from('offer-attachments').getPublicUrl(att.path)
          const url = data.publicUrl
          if (att.type.startsWith('image/')) {
            return (
              <img
                key={att.path}
                src={url}
                alt={att.name}
                className="mt-2 max-w-full rounded"
              />
            )
          }
          return (
            <a
              key={att.path}
              href={url}
              target="_blank"
              rel="noreferrer"
              className="block mt-2 underline"
            >
              {att.name} ({Math.round(att.size / 1024)}KB)
            </a>
          )
        })}
        <div className={clsx('mt-2 text-[11px] uppercase tracking-wide', isMine ? 'text-right' : 'text-left')}>
          {time} {read && '✓'}
        </div>
      </div>
    </div>
  )
}
