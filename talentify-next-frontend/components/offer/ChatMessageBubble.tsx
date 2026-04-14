'use client'

import { createClient } from '@/utils/supabase/client'
import type { OfferMessage } from '@/lib/supabase/offerMessages'
import { clsx } from 'clsx'
import { format } from 'date-fns'

interface ChatMessageBubbleProps {
  message: OfferMessage
  currentUserId: string
  peerLastReadAt?: string | null
  senderName: string
}

export default function ChatMessageBubble({
  message,
  currentUserId,
  peerLastReadAt,
  senderName,
}: ChatMessageBubbleProps) {
  const isMine = message.sender_user === currentUserId
  const supabase = createClient()
  const time = format(new Date(message.created_at), 'HH:mm')
  const read = isMine && peerLastReadAt && new Date(peerLastReadAt) >= new Date(message.created_at)

  return (
    <div className={clsx('flex', isMine ? 'justify-end' : 'justify-start')}>
      <div className={clsx('flex max-w-[72%] flex-col', isMine ? 'items-end' : 'items-start')}>
        {!isMine && <p className="mb-1 px-1 text-[11px] font-medium text-[#6B7280]">{senderName}</p>}

        <div
          className={clsx(
            'rounded-2xl px-3 py-2 text-sm leading-relaxed',
            isMine ? 'bg-[#9EEA6A] text-[#111827]' : 'bg-[#ECECEC] text-[#1F2937]',
          )}
        >
          {message.body && <p className="whitespace-pre-wrap break-words">{message.body}</p>}
          {message.attachments?.map(att => {
            const { data } = supabase.storage.from('offer-attachments').getPublicUrl(att.path)
            const url = data.publicUrl
            if (att.type.startsWith('image/')) {
              return <img key={att.path} src={url} alt={att.name} className="mt-2 max-w-full rounded-md" />
            }
            return (
              <a
                key={att.path}
                href={url}
                target="_blank"
                rel="noreferrer"
                className={clsx('mt-2 block text-xs underline', isMine ? 'text-[#1F2937]' : 'text-[#374151]')}
              >
                {att.name} ({Math.round(att.size / 1024)}KB)
              </a>
            )
          })}
        </div>

        <p className={clsx('mt-1 px-1 text-[10px]', isMine ? 'text-right text-[#9CA3AF]' : 'text-[#9CA3AF]')}>
          {isMine && read ? `既読 ${time}` : time}
        </p>
      </div>
    </div>
  )
}
