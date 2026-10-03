'use client'

import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { CalendarDays, Clock3, Search } from 'lucide-react'
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

const TIME_OPTIONS = Array.from({ length: 16 }, (_, i) => {
  const hour = i + 8
  return `${String(hour).padStart(2, '0')}:00`
})

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

    if (!date) {
      toast.error('希望日を選択してください')
      return
    }
    if (date < minDate) {
      toast.error('本日以降の日付を選択してください')
      return
    }
    if (Boolean(start) !== Boolean(end)) {
      toast.error('時間を指定する場合は開始と終了を両方選択してください')
      return
    }
    if (start && end && !isValidSearchWindow(start, end)) {
      toast.error('終了時刻は開始時刻より後を選択してください')
      return
    }

    const params = new URLSearchParams({ date })
    if (start && end) {
      params.set('start', start)
      params.set('end', end)
    }
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
    hasSearched && date
      ? start && end
        ? `${date.replaceAll('-', '/')} ${start}〜${end}`
        : `${date.replaceAll('-', '/')}・時間指定なし`
      : null

  return (
    <main className="mx-auto max-w-[1320px] space-y-5 p-4 sm:p-6 lg:space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
          日付・時間から演者を探す
        </h1>
        <p className="mt-1.5 text-sm leading-6 text-slate-500">
          希望日に受付可能な演者を検索します。時間を指定すると、締結済み案件と重ならない演者まで絞り込めます。
        </p>
      </div>

      <form
        onSubmit={handleSearch}
        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,.05)] sm:p-5 lg:p-6"
      >
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
            <div className="min-w-0">
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                希望日
              </label>
              <label className="relative flex h-11 min-w-0 cursor-pointer items-center rounded-xl border border-slate-300 bg-white px-3 text-sm font-medium text-slate-900 transition focus-within:border-[#0B1F3B] focus-within:ring-2 focus-within:ring-[#0B1F3B]/10">
                <span className={date ? 'truncate text-slate-900' : 'truncate text-slate-400'}>
                  {date ? date.replace(/-/g, '/') : '日付を選択'}
                </span>
                <CalendarDays className="ml-auto h-4 w-4 shrink-0 text-slate-400" />
                <input
                  type="date"
                  value={date}
                  min={minDate}
                  onChange={e => setDate(e.target.value)}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  aria-label="希望日"
                  required
                />
              </label>
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <Clock3 className="h-3.5 w-3.5 text-slate-400" />
                希望時間帯
                <span className="font-medium text-slate-400">（任意）</span>
              </label>
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                <select
                  value={start}
                  onChange={e => {
                    const next = e.target.value
                    setStart(next)
                    if (end && next && end <= next) setEnd('')
                  }}
                  className="h-11 min-w-0 rounded-xl border border-slate-300 bg-white px-3 text-sm font-medium text-slate-900 outline-none transition focus:border-[#0B1F3B] focus:ring-2 focus:ring-[#0B1F3B]/10"
                >
                  <option value="">開始</option>
                  {TIME_OPTIONS.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
                <span className="text-sm font-bold text-slate-400">〜</span>
                <select
                  value={end}
                  onChange={e => setEnd(e.target.value)}
                  className="h-11 min-w-0 rounded-xl border border-slate-300 bg-white px-3 text-sm font-medium text-slate-900 outline-none transition focus:border-[#0B1F3B] focus:ring-2 focus:ring-[#0B1F3B]/10"
                >
                  <option value="">終了</option>
                  {TIME_OPTIONS
                    .filter(time => !start || time > start)
                    .map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                </select>
              </div>
              <p className="mt-1.5 text-[11px] leading-4 text-slate-500">
                時間未定の場合は空欄のままで検索できます。
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700">
                エリア <span className="font-medium text-slate-400">（任意）</span>
              </label>
              <select
                value={area}
                onChange={e => setArea(e.target.value)}
                className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-medium text-slate-900 outline-none transition focus:border-[#0B1F3B] focus:ring-2 focus:ring-[#0B1F3B]/10"
              >
                <option value="">指定なし</option>
                {areaOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700">
                ジャンル <span className="font-medium text-slate-400">（任意）</span>
              </label>
              <select
                value={genre}
                onChange={e => setGenre(e.target.value)}
                className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-medium text-slate-900 outline-none transition focus:border-[#0B1F3B] focus:ring-2 focus:ring-[#0B1F3B]/10"
              >
                <option value="">指定なし</option>
                {genreOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end border-t border-slate-100 pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="h-11 w-full rounded-xl bg-[#FF5A1F] px-5 font-bold text-white hover:bg-[#E94F18] sm:w-auto"
            >
              <Search className="mr-2 h-4 w-4" />
              {loading ? '検索中...' : 'この条件で検索'}
            </Button>
          </div>
        </div>
      </form>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          空き状況を確認しています…
        </div>
      ) : hasSearched ? (
        <section className="space-y-3">
          {searchSummary && (
            <p className="text-sm text-slate-500">
              {searchSummary} の検索結果
            </p>
          )}
          {results.length > 0 ? (
            <TalentList talents={results} totalCount={results.length} />
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
              <p className="font-bold text-slate-900">条件に合う演者は見つかりませんでした</p>
              <p className="mt-1 text-sm text-slate-500">
                時間指定を外すか、エリア・ジャンルを変えて検索してください。
              </p>
            </div>
          )}
        </section>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-7 text-center text-sm text-slate-500">
          希望日を選択して検索してください。時間・エリア・ジャンルは任意です。
        </div>
      )}
    </main>
  )
}
