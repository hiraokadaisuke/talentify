'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000'

export default function PerformerDetailPage({ params }) {
  const { id } = params
  const [talent, setTalent] = useState(null)

  useEffect(() => {
    const fetchTalent = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/talents/${id}`)
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        setTalent(data)
      } catch (e) {
        console.error(e)
      }
    }
    fetchTalent()
  }, [id])

  if (!talent) {
    return (
      <main className="max-w-3xl mx-auto p-4">
        <p>Loading...</p>
      </main>
    )
  }

  return (
    <main className="max-w-3xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">{talent.name}</h1>
      {talent.skills && talent.skills.length > 0 && (
        <p>
          <span className="font-medium">スキル: </span>
          {talent.skills.join(', ')}
        </p>
      )}
      <p>
        <span className="font-medium">経験年数: </span>
        {talent.experienceYears}年
      </p>
      <hr />
      <p className="text-gray-500">プロフィール詳細は今後ここに表示されます。</p>
      <Link href="/performers" className="text-blue-600 underline">
        演者一覧に戻る
      </Link>
    </main>
  )
}
