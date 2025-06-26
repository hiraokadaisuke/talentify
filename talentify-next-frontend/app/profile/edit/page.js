'use client'
import { useState, useEffect } from 'react'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000'

export default function ProfileEditPage() {
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/profile`, {
          credentials: 'include',
        })
        if (!res.ok) throw new Error('failed')
        const data = await res.json()
        if (data) {
          setDisplayName(data.displayName || '')
          setBio(data.bio || '')
        }
      } catch (e) {
        console.error(e)
      }
    }
    fetchProfile()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    try {
      const res = await fetch(`${API_BASE}/api/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ displayName, bio }),
      })
      if (!res.ok) throw new Error('failed')
      setMessage('保存しました')
    } catch (err) {
      console.error(err)
      setMessage('更新に失敗しました')
    }
  }

  return (
    <main className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">プロフィール編集</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">表示名</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block mb-1">自己紹介</label>
          <textarea
            className="w-full p-2 border rounded"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </div>
        {message && <p>{message}</p>}
        <button type="submit" className="py-2 px-4 bg-blue-600 text-white rounded">
          保存
        </button>
      </form>
    </main>
  )
}
