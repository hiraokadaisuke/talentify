'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalFooter,
  ModalClose,
} from '@/components/ui/modal'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { sendMessage } from '@/lib/messages'
import { useRouter } from 'next/navigation'

interface NewMessageModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  conversationId: string
  talentName: string
}

export default function NewMessageModal({ open, onOpenChange, conversationId, talentName }: NewMessageModalProps) {
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    if (open) {
      setBody('')
      setTimeout(() => textareaRef.current?.focus(), 0)
    }
  }, [open])

  const handleSend = async () => {
    if (!body.trim()) return
    setLoading(true)
    try {
      await sendMessage(conversationId, body.trim())
      onOpenChange(false)
      router.push(`/messages/${conversationId}`)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>{talentName} さんにメッセージ</ModalTitle>
        </ModalHeader>
        <div>
          <Textarea
            ref={textareaRef}
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="メッセージを入力"
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
          />
        </div>
        <ModalFooter>
          <ModalClose asChild>
            <Button variant="secondary">キャンセル</Button>
          </ModalClose>
          <Button onClick={handleSend} disabled={loading}>
            {loading ? '送信中...' : '送信'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
