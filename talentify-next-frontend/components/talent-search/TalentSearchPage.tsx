"use client"

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { SupabaseClient } from '@supabase/supabase-js'
import { toast } from 'sonner'
import TalentSearchForm, { SearchFilters } from './TalentSearchForm'
import TalentList from './TalentList'
import type { PublicTalent } from '@/types/talent'

const ITEMS_PER_PAGE = 6

export default function TalentSearchPage() {
  const [talents, setTalents] = useState<PublicTalent[]>([])
  const [results, setResults] = useState<PublicTalent[]>([])
  const [page, setPage] = useState(1)

  useEffect(() => {
    const fetchTalents = async () => {
      const supabase = createClient() as SupabaseClient<any>
      const { data, error } = await supabase
        .from('public_talent_profiles')
        .select('id, stage_name, genre, area, avatar_url, rate, rating, bio')
        .returns<PublicTalent[]>()

      if (error) {
        console.error('タレントの取得に失敗しました:', error)
        toast.error('タレントの取得に失敗しました')
        setTalents([])
        setResults([])
        return
      }

      setTalents(data ?? [])
      setResults(data ?? [])
    }

    fetchTalents()
  }, [])

  const handleSearch = (f: SearchFilters) => {
    const keyword = f.keyword.toLowerCase()
    const filtered = talents.filter(t =>
      (!f.keyword ||
        t.stage_name?.toLowerCase().includes(keyword) ||
        t.bio?.toLowerCase().includes(keyword)) &&
      (!f.genre || t.genre === f.genre) &&
      (!f.area || t.area === f.area)
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
