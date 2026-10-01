'use client'

import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import TalentList from '@/components/talent-search/TalentList'
import type { PublicTalent } from '@/types/talent'
import { createClient } from '@/utils/supabase/client'
import { getTodayJstDateString } from '@/utils/jstDate'
import {
  extractAreaTokens,
  isValidSearchWindow,
} from '@/lib/search/calendarAvailability'

type FacetTalent = {
  area: string | null
  genre: string | null
}

export default function CalendarSearchPage() {
  const supabase = useMemo(() => createClient(), [])
  const [date, setDate] = useState('')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [area, setArea] = useState('')
  const [genre, setGenre] = useState('')
  const [results, setResults] = useState<PublicTalent[]>([])
  const [facetTalents, setFacetTalents] = useState<FacetTalent[]>([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const minDate = getTodayJstDateString()

  useEffect(() => {
    const loadFacets = async () => {
      const { data, error } = await supabase
        .from('public_talent_profiles')
        .select('area,genre')

      if (error) {
        console.error('[calendar search] failed to load filters', error)
        return
      }

      setFacetTalents((data ?? []) as FacetTalent[])
    }

    void loadFacets()
  }, [supabase])

  const areaOptions = useMemo(
    () =>
      [...new Set(facetTalents.flatMap(talent => extractAreaTokens(talent.area)))]
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b, 'ja')),
    [facetTalents]
  )

  const genreOptions = useMemo(
    () =>
      [...new Set(
        facetTalents
          .map(talent => talent.genre?.trim())
          .filter((value): value is string => Boolean(value))
      )].sort((a, b) => a.localeCompare(b, 'ja')),
    [facetTalents]
  )

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!date || !start || !end) {
      toast.error('日付と時間帯を入力してください')
      return
    }
    if (date < minDate) {
      toast.error('本日以降の日付を選択してください')
      return
    }
    if (!isValidSearchWindow(start, end)) {
      toast.error('終了時刻は開始時刻より後を選択してください')
      return
    }

    const params = new URLSearchParams({ date, start, end })
    if (area) params.set('area', area)
    if (genre) params.set('genre', genre)

    setLoading(true)
    setHasSearched(true)

    try {
      const response = await fetch(`/api/talents/search-by-date?${params.toString()}`, {
        credentials: 'include',
      })
      const body = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(body?.error || '検索に失敗しました')
      }

      setResults((body ?? []) as PublicTalent[])
    } catch (error) {
      console.error('[calendar search]', error)
      setResults([])
      toast.error(error instanceof Error ? error.message : '検索に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const searchSummary =
    hasSearched && date && start && end
      ? `${date.replaceAll('-', '/')} ${start}〜${end}`
      : null

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-bold">日時から演者を探す</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          希望日時に対応可能で、締結済み案件と時間が重ならない演者を検索します。
        </p>
      </div>

      <form
        onSubmit={handleSearch}
        className="rounded-xl border bg-white p-4 shadow-sm sm:p-5"
      >
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
          <div>
            <label className="mb-1 block text-sm font-medium">希望日</label>
            <Input
              type="date"
              value={date}
              min={minDate}
              onChange={e => setDate(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">開始時刻</label>
            <Input
              type="time"
              value={start}
              onChange={e => setStart(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">終了時刻</label>
            <Input
              type="time"
              value={end}
              onChange={e => setEnd(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">エリア</label>
            <select
              value={area}
              onChange={e => setArea(e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">指定なし</option>
              {areaOptions.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">ジャンル</label>
            <select
              value={genre}
              onChange={e => setGenre(e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">指定なし</option>
              {genreOptions.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button type="submit" disabled={loading}>
            <Search className="mr-2 h-4 w-4" />
            {loading ? '検索中...' : 'この日時で検索'}
          </Button>
        </div>
      </form>

      {loading ? (
        <div className="rounded-xl border bg-white p-8 text-center text-sm text-muted-foreground">
          空き状況を確認しています…
        </div>
      ) : hasSearched ? (
        <section className="space-y-3">
          {searchSummary && (
            <p className="text-sm text-muted-foreground">
              {searchSummary} の検索結果
            </p>
          )}
          {results.length > 0 ? (
            <TalentList talents={results} totalCount={results.length} />
          ) : (
            <div className="rounded-xl border bg-white p-8 text-center">
              <p className="font-medium">この時間帯に条件が合う演者は見つかりませんでした</p>
              <p className="mt-1 text-sm text-muted-foreground">
                時間帯やエリア、ジャンルを変えて検索してください。
              </p>
            </div>
          )}
        </section>
      ) : (
        <div className="rounded-xl border border-dashed bg-white/60 p-8 text-center text-sm text-muted-foreground">
          希望日と開始・終了時刻を入力して検索してください。
        </div>
      )}
    </main>
  )
}
