'use client'
import { useEffect, useState } from 'react'
import PerformerCard from '../../components/PerformerCard'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000'

export default function PerformersPage() {
  const [talents, setTalents] = useState([])
  const [query, setQuery] = useState('')

  useEffect(() => {
    const fetchTalents = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/talents`, {
          credentials: 'include', // include cookies for authenticated APIs
        })
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        setTalents(data)
      } catch (e) {
        console.error(e)
      }
    }
    fetchTalents()
  }, [])

  const normalized = query.toLowerCase()
  const filtered = talents.filter(t =>
    t.name.toLowerCase().includes(normalized) ||
    (t.skills || []).some(s => s.toLowerCase().includes(normalized))
  )

  return (
    <main className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">演者を探す</h1>
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="名前・スキルで検索"
        className="w-full p-2 border rounded mb-6"
      />
      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map(t => (
          <PerformerCard key={t.id} talent={t} />
        ))}
        {filtered.length === 0 && (
          <p>該当する演者が見つかりませんでした。</p>
        )}
      </div>
    </main>
  )
}
