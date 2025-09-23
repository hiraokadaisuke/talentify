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
  const time = format(new Date(message.created_at), 'yyyy/MM/dd HH:mm')
  const read = isMine && peerLastReadAt && new Date(peerLastReadAt) >= new Date(message.created_at)

  return (
    <div className={clsx('mb-3 flex', isMine ? 'justify-end' : 'justify-start')}>
      <div
        className={clsx(
          'max-w-[80%] rounded-3xl px-5 py-4 text-sm shadow-md',
          isMine ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-900'
        )}
      >
        <div className="space-y-1">
          <p className={clsx('text-sm font-semibold', isMine ? 'text-white' : 'text-slate-900')}>{senderName}</p>
          <p className={clsx('text-xs', isMine ? 'text-white/80' : 'text-slate-500')}>{time}</p>
        </div>
        {message.body && (
          <p className={clsx('mt-3 whitespace-pre-wrap break-words text-sm', isMine ? 'text-white' : 'text-slate-900')}>
            {message.body}
          </p>
        )}
        {message.attachments?.map(att => {
          const { data } = supabase.storage.from('offer-attachments').getPublicUrl(att.path)
          const url = data.publicUrl
          if (att.type.startsWith('image/')) {
            return (
              <img
                key={att.path}
                src={url}
                alt={att.name}
                className="mt-3 max-w-full rounded-md"
              />
            )
          }
          return (
            <a
              key={att.path}
              href={url}
              target="_blank"
              rel="noreferrer"
              className={clsx(
                'mt-3 block text-sm underline',
                isMine ? 'text-white' : 'text-blue-600'
              )}
            >
              {att.name} ({Math.round(att.size / 1024)}KB)
            </a>
          )
        })}
        {isMine && read && (
          <div className="mt-3 text-right text-[11px] text-white/80">既読</div>
        )}
      </div>
    </div>
  )
}
