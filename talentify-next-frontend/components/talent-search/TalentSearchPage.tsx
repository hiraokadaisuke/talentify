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
import { AlertCircle, Search } from 'lucide-react'

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
    <main className="mx-auto min-w-0 w-full max-w-[1500px] space-y-4 py-2 sm:space-y-5 sm:py-4">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,.05)]">
        <div className="flex items-start gap-3 p-5 sm:p-6">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#0B1F3B] text-[#FFC400]">
            <Search className="h-5 w-5" />
          </span>
          <div>
            <p className="text-[11px] font-black tracking-[0.16em] text-[#C2410C]">TALENT SEARCH</p>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950">演者から探す</h1>
            <p className="mt-1 text-sm leading-6 text-slate-500">条件を絞り込み、プロフィールを見ながら依頼したい演者を探せます。</p>
          </div>
        </div>
        <div className="h-1 bg-gradient-to-r from-[#FF3B2E] via-[#FF8A00] to-[#FFC400]" />
      </section>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[270px_minmax(0,1fr)] lg:items-start">
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
                    className={`min-h-9 min-w-9 rounded-xl border px-3 py-1 text-sm font-bold transition ${p === page ? 'border-[#FF5A1F] bg-[#FF5A1F] text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-orange-200 hover:bg-orange-50'}`}
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
