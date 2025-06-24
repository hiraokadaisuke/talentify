'use client'
import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

const initialThreads = [
  {
    id: 1,
    name: '山田太郎',
    avatar: '/avatar-default.svg',
    latest: '次回のスケジュールについてご確認ください',
    unread: 2,
    updatedAt: '2025/04/25 12:00',
    messages: [
      { id: 1, from: 'store', text: 'こんにちは、次回のスケジュールですが…', time: '2025/04/24 09:00' },
      { id: 2, from: 'performer', text: 'はい、承知しました！', time: '2025/04/24 09:10' }
    ]
  },
  {
    id: 2,
    name: '佐藤花子',
    avatar: '/avatar-default.svg',
    latest: '契約書をお送りしました',
    unread: 0,
    updatedAt: '2025/04/20 16:30',
    messages: [
      { id: 1, from: 'store', text: '契約書をお送りします。ご確認ください。', time: '2025/04/20 16:30' }
    ]
  }
]

const phrases = ['よろしくお願いします', 'ご確認ください', 'ありがとうございます']

export default function MessageBoxPage() {
  const [threads, setThreads] = useState(initialThreads)
  const [activeId, setActiveId] = useState(initialThreads[0].id)
  const [input, setInput] = useState('')
  const [selectedFiles, setSelectedFiles] = useState([])
  const [selectedPhrase, setSelectedPhrase] = useState('')
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeId, threads])

  useEffect(() => {
    setThreads(prev => prev.map(t => t.id === activeId ? { ...t, unread: 0, messages: t.messages.map(m => ({ ...m, read: true })) } : t))
    const thread = threads.find(t => t.id === activeId)
    thread?.messages.forEach(m => {
      if (!m.read && m._id) {
        fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/messages/${m._id}/read`, { method: 'PATCH' })
      }
    })
  }, [activeId])

  const activeThread = threads.find(t => t.id === activeId)

  const handleFileChange = (e) => {
    setSelectedFiles(Array.from(e.target.files))
  }

  const handleSend = async () => {
    const text = input || selectedPhrase
    if (!text && selectedFiles.length === 0) return
    const formData = new FormData()
    formData.append('threadId', activeId)
    formData.append('from', 'store')
    formData.append('text', text)
    selectedFiles.forEach(f => formData.append('attachments', f))
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/messages`, {
      method: 'POST',
      body: formData
    })
    const saved = await res.json()
    const newMessage = { ...saved }
    setThreads(prev => prev.map(t => t.id === activeId ? {
      ...t,
      messages: [...t.messages, newMessage],
      latest: text,
      updatedAt: newMessage.createdAt || new Date().toLocaleString(),
      unread: 0
    } : t))
    setInput('')
    setSelectedFiles([])
    setSelectedPhrase('')
  }

  return (
    <main className="flex h-[80vh] border rounded overflow-hidden">
      <aside className="w-1/3 border-r overflow-y-auto">
        {threads.sort((a,b) => new Date(b.updatedAt) - new Date(a.updatedAt)).map(thread => (
          <div key={thread.id} className={`flex items-center px-4 py-3 cursor-pointer hover:bg-gray-50 ${activeId===thread.id?'bg-gray-100':''}`} onClick={() => setActiveId(thread.id)}>
            <Image src={thread.avatar} alt="avatar" width={40} height={40} className="rounded-full mr-3" />
            <div className="flex-1">
              <p className="font-semibold text-sm">{thread.name}</p>
              <p className="text-xs text-gray-500 truncate">{thread.latest}</p>
            </div>
            {thread.unread > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2">{thread.unread}</span>
            )}
          </div>
        ))}
      </aside>
      <section className="flex flex-col flex-1">
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {activeThread.messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.from === 'store' ? 'justify-end' : 'justify-start'}`}>
              <div className={`rounded px-3 py-2 max-w-xs ${msg.from === 'store' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                {msg.text && <p>{msg.text}</p>}
                {msg.attachments && msg.attachments.map((url,i) => (
                  url.endsWith('.pdf') ? (
                    <a key={i} href={url} target="_blank" rel="noopener" className="text-blue-600 underline block mt-1">PDF {i+1}</a>
                  ) : (
                    <Image key={i} src={url} alt="attachment" width={200} height={200} className="mt-1 rounded" />
                  )
                ))}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="border-t p-3 flex items-end space-x-2">
          <select value={selectedPhrase} onChange={e => setSelectedPhrase(e.target.value)} className="border rounded p-2">
            <option value="">定型文を選択</option>
            {phrases.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <input type="file" multiple accept="image/*,application/pdf" onChange={handleFileChange} />
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="メッセージを入力"
            className="flex-1 border rounded p-2 resize-none"
            rows={2}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          />
          <button onClick={handleSend} className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700">送信</button>
        </div>
      </section>
    </main>
  )
}
