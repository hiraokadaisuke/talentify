'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewTalentPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [profile, setProfile] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const res = await fetch('/api/talents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, profile }),
    })

    if (res.ok) {
      router.push('/talents') // 一覧に戻る
    } else {
      alert('登録に失敗しました')
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">新規演者登録</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="名前"
          className="border p-2 w-full"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="メールアドレス"
          className="border p-2 w-full"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <textarea
          placeholder="プロフィール"
          className="border p-2 w-full"
          value={profile}
          onChange={(e) => setProfile(e.target.value)}
          required
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          登録する
        </button>
      </form>
    </div>
  )
}
