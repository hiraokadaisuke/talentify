'use client'

import {
  ChangeEvent,
  KeyboardEvent,
  useRef,
  useState,
} from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import type { OfferMessage } from '@/lib/supabase/offerMessages'
import {
  MAX_OFFER_MESSAGE_ATTACHMENTS,
  OFFER_ATTACHMENT_MIME_TO_EXTENSION,
  validateOfferAttachmentFileMetadata,
} from '@/lib/messages/attachments'
import {
  OfferAttachmentUploadError,
  uploadOfferAttachment,
  type UploadedOfferAttachment,
} from '@/lib/messages/upload-offer-attachment'
import { FileText, Loader2, Paperclip, X } from 'lucide-react'
import { toast } from 'sonner'

interface OfferChatInputProps {
  offerId: string
  senderRole: 'store' | 'talent' | 'admin'
  receiverUserId: string
  onSent?: (msg: OfferMessage) => void
}

type PendingAttachmentStatus =
  | 'selected'
  | 'uploading'
  | 'uploaded'
  | 'error'

type PendingAttachment = {
  id: string
  file: File
  status: PendingAttachmentStatus
  uploaded?: UploadedOfferAttachment
}

const ACCEPTED_ATTACHMENT_TYPES = Object.keys(
  OFFER_ATTACHMENT_MIME_TO_EXTENSION,
).join(',')

function formatFileSize(size: number) {
  if (size < 1024 * 1024) {
    return `${Math.max(1, Math.round(size / 1024))}KB`
  }

  return `${(size / (1024 * 1024)).toFixed(1)}MB`
}

function getValidationMessage(code: string) {
  switch (code) {
    case 'unsupported_file_type':
      return '対応していないファイル形式です'
    case 'invalid_file_size':
      return '添付ファイルは10MB以下にしてください'
    case 'invalid_file_name':
      return 'ファイル名を確認してください'
    default:
      return 'このファイルは添付できません'
  }
}

function getUploadMessage(error: unknown) {
  if (error instanceof OfferAttachmentUploadError) {
    if (error.code === 'unsupported_file_type') {
      return '対応していないファイル形式です'
    }
    if (error.code === 'invalid_file_size') {
      return '添付ファイルは10MB以下にしてください'
    }
    if (error.code === 'not_offer_participant') {
      return 'この案件ではファイルを送信できません'
    }
  }

  return 'ファイルのアップロードに失敗しました'
}

function fileFingerprint(file: File) {
  return [
    file.name,
    file.size,
    file.type,
    file.lastModified,
  ].join(':')
}

export default function OfferChatInput({
  offerId,
  receiverUserId,
  onSent,
}: OfferChatInputProps) {
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [attachments, setAttachments] = useState<PendingAttachment[]>([])
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const attachmentSequence = useRef(0)

  const updateAttachment = (
    id: string,
    updates: Partial<PendingAttachment>,
  ) => {
    setAttachments(current =>
      current.map(item =>
        item.id === id ? { ...item, ...updates } : item,
      ),
    )
  }

  const onFilesSelected = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? [])
    event.target.value = ''

    if (selectedFiles.length === 0) return

    const availableSlots =
      MAX_OFFER_MESSAGE_ATTACHMENTS - attachments.length

    if (availableSlots <= 0) {
      toast.error(
        `添付ファイルは${MAX_OFFER_MESSAGE_ATTACHMENTS}件までです`,
      )
      return
    }

    const existingFingerprints = new Set(
      attachments.map(item => fileFingerprint(item.file)),
    )
    const accepted: PendingAttachment[] = []

    for (const file of selectedFiles) {
      if (accepted.length >= availableSlots) break

      const fingerprint = fileFingerprint(file)
      if (existingFingerprints.has(fingerprint)) {
        continue
      }

      const validation = validateOfferAttachmentFileMetadata({
        fileName: file.name,
        contentType: file.type,
        size: file.size,
      })

      if (validation.ok === false) {
        toast.error(
          `${file.name}: ${getValidationMessage(validation.error)}`,
        )
        continue
      }

      attachmentSequence.current += 1
      existingFingerprints.add(fingerprint)
      accepted.push({
        id: `attachment-${attachmentSequence.current}`,
        file,
        status: 'selected',
      })
    }

    if (
      selectedFiles.length > availableSlots &&
      accepted.length >= availableSlots
    ) {
      toast.error(
        `添付ファイルは${MAX_OFFER_MESSAGE_ATTACHMENTS}件までです`,
      )
    }

    if (accepted.length > 0) {
      setAttachments(current => [...current, ...accepted])
    }
  }

  const removeAttachment = (id: string) => {
    if (sending) return
    setAttachments(current =>
      current.filter(item => item.id !== id),
    )
  }

  const handleSend = async () => {
    const messageBody = body.trim()

    if (
      (!messageBody && attachments.length === 0) ||
      !receiverUserId ||
      sending
    ) {
      return
    }

    setSending(true)

    try {
      const preparedAttachments: UploadedOfferAttachment[] = []

      for (const attachment of attachments) {
        if (attachment.uploaded) {
          preparedAttachments.push(attachment.uploaded)
          continue
        }

        updateAttachment(attachment.id, {
          status: 'uploading',
        })

        try {
          const uploaded = await uploadOfferAttachment({
            offerId,
            receiverUserId,
            file: attachment.file,
          })

          updateAttachment(attachment.id, {
            status: 'uploaded',
            uploaded,
          })
          preparedAttachments.push(uploaded)
        } catch (error) {
          updateAttachment(attachment.id, {
            status: 'error',
          })
          toast.error(
            `${attachment.file.name}: ${getUploadMessage(error)}`,
          )
          return
        }
      }

      const res = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverUserId,
          offerId,
          body: messageBody,
          attachments: preparedAttachments.map(
            ({ path, name, type, size }) => ({
              path,
              name,
              type,
              size,
            }),
          ),
        }),
      })

      const payload = await res.json().catch(() => null)

      if (!res.ok || !payload?.data) {
        throw new Error(payload?.error ?? 'send_failed')
      }

      setBody('')
      setAttachments([])
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      onSent?.(payload.data as OfferMessage)
    } catch (error) {
      console.error('failed to send offer message', error)
      toast.error(
        'メッセージの送信に失敗しました。内容を残したまま再送できます。',
      )
    } finally {
      setSending(false)
    }
  }

  const onKeyDown = (
    event: KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      void handleSend()
    }
  }

  const canSend =
    !!receiverUserId &&
    !sending &&
    (!!body.trim() || attachments.length > 0)

  return (
    <div className="space-y-2.5">
      {attachments.length > 0 && (
        <div className="space-y-2">
          {attachments.map(attachment => {
            const isUploading = attachment.status === 'uploading'
            const statusLabel =
              attachment.status === 'uploaded'
                ? 'アップロード済み'
                : attachment.status === 'error'
                  ? '再送時に再試行'
                  : isUploading
                    ? 'アップロード中'
                    : '送信時にアップロード'

            return (
              <div
                key={attachment.id}
                className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2"
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm">
                  {isUploading ? (
                    <Loader2
                      className="size-4 animate-spin"
                      aria-hidden="true"
                    />
                  ) : (
                    <FileText
                      className="size-4"
                      aria-hidden="true"
                    />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-slate-700">
                    {attachment.file.name}
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    {formatFileSize(attachment.file.size)} / {statusLabel}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => removeAttachment(attachment.id)}
                  disabled={sending}
                  aria-label={`${attachment.file.name}を削除`}
                  className="flex size-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-white hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              </div>
            )
          })}
        </div>
      )}

      <Textarea
        value={body}
        onChange={event => setBody(event.target.value)}
        onKeyDown={onKeyDown}
        disabled={sending}
        placeholder="メッセージを入力"
        rows={2}
        className="min-h-[72px] resize-none rounded-3xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm focus-visible:border-emerald-400 focus-visible:ring-emerald-200"
      />

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={ACCEPTED_ATTACHMENT_TYPES}
        onChange={onFilesSelected}
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
      />

      <div className="flex flex-col gap-2 text-[11px] text-slate-400 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={
              sending ||
              !receiverUserId ||
              attachments.length >= MAX_OFFER_MESSAGE_ATTACHMENTS
            }
            className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 font-medium text-slate-600 transition hover:border-emerald-300 hover:text-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-300"
          >
            <Paperclip className="size-4" aria-hidden="true" />
            ファイル
          </button>

          <p className="truncate">
            {receiverUserId
              ? `最大${MAX_OFFER_MESSAGE_ATTACHMENTS}件・1件10MBまで / Shift + Enterで改行`
              : '送信先ユーザー情報を読み込み中です。'}
          </p>
        </div>

        <Button
          onClick={() => void handleSend()}
          disabled={!canSend}
          className="min-h-11 w-full rounded-full bg-emerald-500 px-5 text-white transition hover:bg-emerald-600 disabled:bg-slate-300 sm:w-auto"
        >
          {sending ? '送信中...' : '送信'}
        </Button>
      </div>
    </div>
  )
}
