'use client'

import { useEffect, useState, useRef } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { sendMessage } from '@/lib/messages'
import { useParams } from 'next/navigation'

interface MessageRow {
  id: string
  sender_user: string
  receiver_user: string
  body: string
  created_at: string | null
}

export default function ConversationPage() {
  const params = useParams()
  const conversationId = params.conversationId as string
  const [messages, setMessages] = useState<MessageRow[]>([])
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const init = async () => {
      const res = await fetch(`/api/messages/inbox?userId=${conversationId}`)
      if (res.ok) {
        const { data }: { data: MessageRow[] } = await res.json()
        setMessages(data)
      }
    }
    init()
  }, [conversationId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return
    await sendMessage(conversationId, input.trim())
    setInput('')
  }

  return (
    <main className="flex flex-col h-[80vh] border rounded overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map(m => (
          <div key={m.id} className={`flex ${m.sender_user === conversationId ? 'justify-start' : 'justify-end'}`}>
            <div className={`rounded px-3 py-2 max-w-xs ${m.sender_user === conversationId ? 'bg-gray-100' : 'bg-blue-100'}`}>{m.body}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="border-t p-3 flex items-end space-x-2">
        <Textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="メッセージを入力"
          rows={2}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSend()
            }
          }}
        />
        <Button onClick={handleSend}>送信</Button>
      </div>
    </main>
  )
}
