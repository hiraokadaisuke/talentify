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
  const [visitDate, setVisitDate] = useState('')
  const [timeRange, setTimeRange] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      alert('ログインしてください')
      return
    }

    const { data: store } = await supabase
      .from('stores')
      .select('id')
      .eq('user_id', user.id)
      .single()
    if (!store) {
      alert('店舗情報が見つかりません')
      return
    }

    const res = await fetch('/api/offers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        store_id: store.id,
        talent_id: talentId,
        date: visitDate,
        time_range: timeRange,
        agreed,
        message,
      }),
    })

    const result = await res.json()
    if (!res.ok || !result.ok) {
      console.error('送信エラー:', result)
      alert(result.reason ? String(result.reason) : '送信に失敗しました')
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
            value={visitDate}
            onChange={e => setVisitDate(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">希望時間帯</label>
          <Input
            value={timeRange}
            onChange={e => setTimeRange(e.target.value)}
            placeholder="例: 10:00~"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            id="agree"
            type="checkbox"
            checked={agreed}
            onChange={e => setAgreed(e.target.checked)}
            required
          />
          <label htmlFor="agree" className="text-sm">出演条件に同意します</label>
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
