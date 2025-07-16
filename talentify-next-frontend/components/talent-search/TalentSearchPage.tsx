"use client"

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client' // あなたのSupabaseラッパー
import TalentSearchForm, { SearchFilters } from './TalentSearchForm'
import TalentList from './TalentList'
import { Talent } from './TalentCard'

const ITEMS_PER_PAGE = 6

export default function TalentSearchPage() {
  const [talents, setTalents] = useState<Talent[]>([])
  const [results, setResults] = useState<Talent[]>([])
  const [page, setPage] = useState(1)

  useEffect(() => {
    const fetchTalents = async () => {
      const supabase = createClient()
      const { data, error } = await supabase.from('talents').select('*')

      if (error) {
        console.error('タレントの取得に失敗しました:', error)
        return
      }

      setTalents(data as Talent[])
      setResults(data as Talent[])
    }

    fetchTalents()
  }, [])

  const handleSearch = (f: SearchFilters) => {
    const keyword = f.keyword.toLowerCase()
    const filtered = talents.filter(t =>
      (!f.keyword || t.name.toLowerCase().includes(keyword) || t.genre.includes(keyword)) &&
      (!f.genre || t.genre === f.genre) &&
      (!f.gender || t.gender === f.gender) &&
      (!f.age || t.ageGroup === f.age) &&
      (!f.location || t.location === f.location)
    )
    setResults(filtered)
    setPage(1)
  }

  const totalPages = Math.ceil(results.length / ITEMS_PER_PAGE) || 1
  const paginated = results.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  return (
    <main className="max-w-5xl mx-auto p-4 space-y-6">
      <TalentSearchForm onSearch={handleSearch} />
      <TalentList talents={paginated} />
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <nav className="flex space-x-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`px-3 py-1 border rounded ${p === page ? 'bg-blue-600 text-white' : 'bg-white'}`}
              >
                {p}
              </button>
            ))}
          </nav>
        </div>
      )}
    </main>
  )
}
