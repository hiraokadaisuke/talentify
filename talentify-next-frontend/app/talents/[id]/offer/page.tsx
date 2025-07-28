'use client'


import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { createClient } from '@/utils/supabase/client'

const supabase = createClient()

export default function OfferPage() {
  const { id } = useParams()
  const talentId = Array.isArray(id) ? id[0] : id
  const [message, setMessage] = useState('')
  const [date, setDate] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      alert('ログインしてください')
      return
    }

    const { error } = await supabase.from('offers').insert([
      {
        user_id: user.id,
        talent_id: talentId,
        message: message,
        date: date,
        status: 'pending', // "offer_created" is not allowed
      },
    ])

    if (error) {
      console.error('送信エラー:', error)
      alert('送信に失敗しました')
      return
    }

    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto p-6">
        <h2 className="text-xl font-bold mb-2">オファーを送信しました！</h2>
        <p>相手からの返事をお待ちください。</p>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">オファーを送る</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">希望日</label>
          <Input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">メッセージ</label>
          <Textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="出演依頼内容などを入力"
          />
        </div>
        <Button type="submit">送信</Button>
      </form>
    </div>
  )
}
