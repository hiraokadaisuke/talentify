'use client'

import { useState } from 'react'
import { updateTalent } from '@/lib/api'

export default function ProfileEditForm({ talentId, initialTalent = {} }) {
  const [name, setName] = useState(initialTalent.name || '')
  const [email, setEmail] = useState(initialTalent.email || '')
  const [skills, setSkills] = useState(
    initialTalent.skills ? initialTalent.skills.join(', ') : ''
  )
  const [success, setSuccess] = useState(null)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSuccess(null)
    setError(null)
    try {
      await updateTalent(talentId, {
        name,
        email,
        skills: skills
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      })
      setSuccess('プロフィールを更新しました。')
    } catch (err) {
      console.error(err)
      setError('更新に失敗しました。')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {success && (
        <div className="bg-green-100 border border-green-300 p-2 rounded">
          {success}
        </div>
      )}
      {error && (
        <div className="bg-red-100 border border-red-300 p-2 rounded">
          {error}
        </div>
      )}
      <div>
        <label className="block mb-1">名前</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      <div>
        <label className="block mb-1">メールアドレス</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      <div>
        <label className="block mb-1">スキル (カンマ区切り)</label>
        <input
          type="text"
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>
      <button
        type="submit"
        className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        更新する
      </button>
    </form>
  )
}
