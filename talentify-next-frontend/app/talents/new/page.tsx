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
    try {
      const res = await fetch('/api/talents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, profile }),
      })

      if (res.ok) {
        router.push('/talents')
      } else {
        const error = await res.text()
        alert(`登録に失敗しました：${error}`)
      }
    } catch (err) {
      console.error('送信エラー:', err)
      alert('通信エラーが発生しました')
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-4 border rounded">
      <h1 className="text-xl font-bold mb-4">新規演者登録</h1>
      <form onSubmit={handleSubmit}>
        <label className="block mb-2">
          名前:
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full mt-1 p-2 border rounded"
            required
          />
        </label>
        <label className="block mb-2">
          メールアドレス:
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mt-1 p-2 border rounded"
            required
          />
        </label>
        <label className="block mb-4">
          プロフィール:
          <textarea
            value={profile}
            onChange={(e) => setProfile(e.target.value)}
            className="w-full mt-1 p-2 border rounded"
            rows={4}
          />
        </label>
        <button
          type="submit"
          className="bg-blue-500 text-white py-2 px-4 rounded"
        >
          登録
        </button>
      </form>
    </div>
  )
}

