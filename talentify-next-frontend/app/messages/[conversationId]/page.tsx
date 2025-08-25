'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { sendMessage } from '@/lib/messages'
import { useParams } from 'next/navigation'

interface MessageRow {
  id: string
  sender_id: string
  topic: string | null
  content: string | null
  created_at: string | null
}

export default function ConversationPage() {
  const supabase = createClient()
  const params = useParams()
  const conversationId = params.conversationId as string
  const [messages, setMessages] = useState<MessageRow[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) setUserId(user.id)

      const { data } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user?.id},topic.eq.${conversationId}),and(sender_id.eq.${conversationId},topic.eq.${user?.id})`)
        .order('created_at', { ascending: true })
      if (data) setMessages(data)
    }
    init()
  }, [conversationId, supabase])

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
          <div key={m.id} className={`flex ${m.sender_id === userId ? 'justify-end' : 'justify-start'}`}>
            <div className={`rounded px-3 py-2 max-w-xs ${m.sender_id === userId ? 'bg-blue-100' : 'bg-gray-100'}`}>{m.content}</div>
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
