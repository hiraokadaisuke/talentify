'use client'

import { useEffect, useState } from 'react'
import type {
  Attachment,
  OfferMessage,
} from '@/lib/supabase/offerMessages'
import { getOfferAttachmentDownloadUrl } from '@/lib/messages/get-offer-attachment-download-url'
import { clsx } from 'clsx'
import { format } from 'date-fns'

interface ChatMessageBubbleProps {
  message: OfferMessage
  currentUserId: string
  peerLastReadAt?: string | null
  senderName: string
}

function formatAttachmentSize(size: number) {
  if (size < 1024 * 1024) {
    return `${Math.max(1, Math.round(size / 1024))}KB`
  }

  return `${(size / (1024 * 1024)).toFixed(1)}MB`
}

export function SecureMessageAttachment({
  messageId,
  attachment,
  isMine,
}: {
  messageId: string
  attachment: Attachment
  isMine: boolean
}) {
  const isImage = attachment.type.startsWith('image/')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewLoading, setPreviewLoading] = useState(isImage)
  const [previewError, setPreviewError] = useState(false)
  const [previewAttempt, setPreviewAttempt] = useState(0)
  const [downloadLoading, setDownloadLoading] = useState(false)
  const [downloadError, setDownloadError] = useState(false)

  useEffect(() => {
    if (!isImage) return

    const controller = new AbortController()
    setPreviewLoading(true)
    setPreviewError(false)

    getOfferAttachmentDownloadUrl({
      messageId,
      path: attachment.path,
      signal: controller.signal,
    })
      .then(({ url }) => {
        setPreviewUrl(url)
      })
      .catch(error => {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return
        }
        setPreviewUrl(null)
        setPreviewError(true)
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setPreviewLoading(false)
        }
      })

    return () => controller.abort()
  }, [attachment.path, isImage, messageId, previewAttempt])

  const openDownload = async () => {
    if (downloadLoading) return

    setDownloadLoading(true)
    setDownloadError(false)

    try {
      const { url } = await getOfferAttachmentDownloadUrl({
        messageId,
        path: attachment.path,
        download: true,
      })

      const link = document.createElement('a')
      link.href = url
      link.target = '_blank'
      link.rel = 'noopener noreferrer'
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch {
      setDownloadError(true)
    } finally {
      setDownloadLoading(false)
    }
  }

  if (isImage) {
    return (
      <div className="mt-2">
        {previewLoading && (
          <div className="flex min-h-[88px] min-w-[160px] items-center justify-center rounded-md bg-white/60 px-3 py-4 text-xs text-[#6B7280]">
            画像を読み込み中…
          </div>
        )}

        {!previewLoading && previewUrl && !previewError && (
          <img
            src={previewUrl}
            alt={attachment.name}
            className="max-h-72 max-w-full rounded-md object-contain"
            onError={() => {
              setPreviewUrl(null)
              setPreviewError(true)
            }}
          />
        )}

        {!previewLoading && previewError && (
          <button
            type="button"
            onClick={() => setPreviewAttempt(value => value + 1)}
            className={clsx(
              'rounded-md border px-3 py-2 text-left text-xs underline',
              isMine
                ? 'border-[#8FC66E] bg-white/50 text-[#111827]'
                : 'border-[#C7C7C7] bg-white/60 text-[#1F2937]',
            )}
          >
            画像を再読み込み
          </button>
        )}

        <button
          type="button"
          onClick={openDownload}
          disabled={downloadLoading}
          className={clsx(
            'mt-1 block text-xs underline disabled:cursor-wait disabled:opacity-60',
            isMine ? 'text-[#111827]' : 'text-[#1F2937]',
          )}
        >
          {downloadLoading
            ? '準備中…'
            : `${attachment.name} (${formatAttachmentSize(attachment.size)})`}
        </button>

        {downloadError && (
          <p className="mt-1 text-[11px] text-red-700">
            ファイルを開けませんでした。もう一度お試しください。
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={openDownload}
        disabled={downloadLoading}
        className={clsx(
          'block text-left text-xs underline disabled:cursor-wait disabled:opacity-60',
          isMine ? 'text-[#111827]' : 'text-[#1F2937]',
        )}
      >
        {downloadLoading
          ? 'ファイルを準備中…'
          : `${attachment.name} (${formatAttachmentSize(attachment.size)})`}
      </button>

      {downloadError && (
        <p className="mt-1 text-[11px] text-red-700">
          ファイルを開けませんでした。もう一度お試しください。
        </p>
      )}
    </div>
  )
}

export default function ChatMessageBubble({
  message,
  currentUserId,
  peerLastReadAt,
  senderName,
}: ChatMessageBubbleProps) {
  const isMine = message.sender_user === currentUserId
  const time = format(new Date(message.created_at), 'HH:mm')
  const read =
    isMine &&
    peerLastReadAt &&
    new Date(peerLastReadAt) >= new Date(message.created_at)

  return (
    <div className={clsx('flex', isMine ? 'justify-end' : 'justify-start')}>
      <div
        className={clsx(
          'flex max-w-[72%] flex-col',
          isMine ? 'items-end' : 'items-start',
        )}
      >
        {!isMine && (
          <p className="mb-1 px-1 text-[11px] font-medium text-[#6B7280]">
            {senderName}
          </p>
        )}

        <div
          className={clsx(
            'rounded-2xl px-3 py-2 text-sm leading-relaxed',
            isMine
              ? 'bg-[#C4F69D] text-[#111827]'
              : 'bg-[#E2E2E2] text-[#111827]',
          )}
        >
          {message.body && (
            <p className="whitespace-pre-wrap break-words">{message.body}</p>
          )}

          {message.attachments?.map(attachment => (
            <SecureMessageAttachment
              key={attachment.path}
              messageId={message.id}
              attachment={attachment}
              isMine={isMine}
            />
          ))}
        </div>

        <p
          className={clsx(
            'mt-1 px-1 text-[10px]',
            isMine ? 'text-right text-[#9CA3AF]' : 'text-[#9CA3AF]',
          )}
        >
          {isMine && read ? `既読 ${time}` : time}
        </p>
      </div>
    </div>
  )
}
