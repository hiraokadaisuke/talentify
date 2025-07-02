'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type Talent = {
  id: string
  name: string
  email: string
  profile: string
}

export default function EditTalentPage({ params }: { params: { id: string } }) {
  const [talent, setTalent] = useState<Talent | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchTalent = async () => {
      const res = await fetch(`/api/talents/${params.id}`)
      if (res.ok) {
        const data = await res.json()
        setTalent(data)
      } else {
        alert('データ取得に失敗しました')
      }
    }
    fetchTalent()
  }, [params.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!talent) return

    const res = await fetch(`/api/talents/${params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(talent),
    })

    if (res.ok) {
      router.push('/talents')
    } else {
      alert('更新に失敗しました')
    }
  }

  if (!talent) return <div className="p-4">読み込み中...</div>

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">演者情報を編集</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          className="border p-2 w-full"
          value={talent.name}
          onChange={(e) => setTalent({ ...talent, name: e.target.value })}
        />
        <input
          type="email"
          className="border p-2 w-full"
          value={talent.email}
          onChange={(e) => setTalent({ ...talent, email: e.target.value })}
        />
        <textarea
          className="border p-2 w-full"
          value={talent.profile}
          onChange={(e) => setTalent({ ...talent, profile: e.target.value })}
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          更新する
        </button>
      </form>
    </div>
  )
}
