"use client"

import { useCallback, useEffect, useMemo, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { SupabaseClient } from '@supabase/supabase-js'
import { toast } from 'sonner'
import TalentSearchForm, { SearchFilters } from './TalentSearchForm'
import TalentList from './TalentList'
import type { PublicTalent } from '@/types/talent'
import TalentCardSkeleton from './TalentCardSkeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { AlertCircle } from 'lucide-react'

const ITEMS_PER_PAGE = 6

const normalizeText = (value: string | null | undefined) => value?.trim().toLowerCase() ?? ''

const extractAreaTokens = (area: string | null | undefined): string[] => {
  if (!area) return []

  const trimmed = area.trim()
  if (!trimmed) return []

  const normalized = trimmed.replace(/[\[\]"]+/g, '')
  return normalized
    .split(/[,、/\s]+/)
    .map(part => part.trim())
    .filter(Boolean)
}

const matchesRateRange = (rate: number | null, rateRange?: SearchFilters['rateRange']) => {
  if (!rateRange) return true
  if (rateRange === 'negotiable') return rate == null
  if (rate == null) return false

  switch (rateRange) {
    case 'under_200k':
      return rate <= 200_000
    case 'between_200k_500k':
      return rate > 200_000 && rate <= 500_000
    case 'over_500k':
      return rate > 500_000
    default:
      return true
  }
}

export default function TalentSearchPage() {
  const [talents, setTalents] = useState<PublicTalent[]>([])
  const [results, setResults] = useState<PublicTalent[]>([])
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetchTalents = async () => {
      setIsLoading(true)
      const supabase = createClient() as SupabaseClient<any>
      const { data, error } = await supabase
        .from('public_talent_profiles')
        .select('id, stage_name, genre, area, avatar_url, rate, rating, bio, display_name')
        .returns<PublicTalent[]>()

      if (error) {
        console.error('タレントの取得に失敗しました:', error)
        toast.error('タレントの取得に失敗しました')
        setTalents([])
        setResults([])
        setError(true)
        setIsLoading(false)
        return
      }

      setTalents(data ?? [])
      setResults(data ?? [])
      setError(false)
      setIsLoading(false)
    }

    fetchTalents()
  }, [])

  const genreOptions = useMemo(
    () =>
      [...new Set(talents.map(talent => talent.genre?.trim()).filter((genre): genre is string => Boolean(genre)))].sort((a, b) =>
        a.localeCompare(b, 'ja')
      ),
    [talents]
  )

  const areaOptions = useMemo(
    () =>
      [...new Set(talents.flatMap(talent => extractAreaTokens(talent.area)))].sort((a, b) => a.localeCompare(b, 'ja')),
    [talents]
  )

  const handleSearch = useCallback(
    (filters: SearchFilters) => {
      const keyword = normalizeText(filters.keyword)
      const filtered = talents.filter(talent => {
        const name = normalizeText(talent.stage_name)
        const displayName = normalizeText(talent.display_name)
        const bio = normalizeText(talent.bio)

        const keywordMatch =
          !keyword || name.includes(keyword) || displayName.includes(keyword) || bio.includes(keyword)

        const genreMatch = !filters.genres.length || (talent.genre ? filters.genres.includes(talent.genre) : false)

        const areaMatch =
          !filters.areas.length ||
          filters.areas.some(areaFilter => {
            const candidate = talent.area ?? ''
            return candidate.includes(areaFilter) || extractAreaTokens(candidate).includes(areaFilter)
          })

        const rateMatch = matchesRateRange(talent.rate, filters.rateRange)

        return keywordMatch && genreMatch && areaMatch && rateMatch
      })

      setResults(filtered)
      setPage(1)
    },
    [talents]
  )

  const totalPages = Math.ceil(results.length / ITEMS_PER_PAGE) || 1
  const paginated = results.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  return (
    <main className="mx-auto space-y-6 px-6 md:px-8 lg:px-12">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start">
        <TalentSearchForm onSearch={handleSearch} genreOptions={genreOptions} areaOptions={areaOptions} />

        <section className="space-y-4">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                <TalentCardSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <EmptyState
              illustration={<AlertCircle className="h-12 w-12 text-muted-foreground" />}
              title="エラーが発生しました"
              actionHref="/search/talents"
              actionLabel="再読み込み"
            />
          ) : (
            <TalentList talents={paginated} totalCount={results.length} />
          )}

          {!isLoading && !error && totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <nav className="flex space-x-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`rounded border px-3 py-1 ${p === page ? 'bg-blue-600 text-white' : 'bg-white'}`}
                  >
                    {p}
                  </button>
                ))}
              </nav>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
