'use client'

import { useEffect, useState } from 'react'
import PerformerCard from '../../components/PerformerCard'
import { supabase } from '@/lib/supabase'  // ← ここを追加

export default function PerformersPage() {
  const [talents, setTalents] = useState([])
  const [query, setQuery] = useState('')

  useEffect(() => {
    const fetchTalents = async () => {
      const { data, error } = await supabase.from('talents').select('*')
      if (error) {
        console.error('Failed to fetch talents:', error)
      } else {
        setTalents(data || [])
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
