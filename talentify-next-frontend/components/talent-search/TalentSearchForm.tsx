'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export type RateRange = 'under_200k' | 'between_200k_500k' | 'over_500k' | 'negotiable'

export type SearchFilters = {
  keyword: string
  genres: string[]
  areas: string[]
  rateRange?: RateRange
}

type TalentSearchFormProps = {
  onSearch: (f: SearchFilters) => void
  genreOptions: string[]
  areaOptions: string[]
}

const INITIAL_FILTERS: SearchFilters = {
  keyword: '',
  genres: [],
  areas: [],
  rateRange: undefined,
}

export default function TalentSearchForm({ onSearch, genreOptions, areaOptions }: TalentSearchFormProps) {
  const [filters, setFilters] = useState<SearchFilters>(INITIAL_FILTERS)
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)

  useEffect(() => {
    onSearch(filters)
  }, [filters, onSearch])

  const toggleArrayFilter = (key: 'genres' | 'areas', value: string) => {
    setFilters(prev => {
      const currentValues = prev[key]
      const nextValues = currentValues.includes(value)
        ? currentValues.filter(item => item !== value)
        : [...currentValues, value]

      return {
        ...prev,
        [key]: nextValues,
      }
    })
  }

  const handleReset = () => {
    setFilters(INITIAL_FILTERS)
  }

  return (
    <>
      <div className="md:hidden rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="space-y-3">
          <Input
            placeholder="名前・PR文で検索"
            value={filters.keyword}
            onChange={e => setFilters(prev => ({ ...prev, keyword: e.target.value }))}
          />
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => setIsMobileFilterOpen(prev => !prev)}
          >
            {isMobileFilterOpen ? '絞り込みを閉じる' : '絞り込み'}
          </Button>
        </div>
      </div>

      <aside className={`rounded-2xl border border-gray-200 bg-white p-5 shadow-sm ${isMobileFilterOpen ? 'block' : 'hidden'} md:sticky md:top-24 md:block md:h-fit`}>
        <div className="space-y-5">
          <section className="space-y-2 border-b border-gray-100 pb-4">
            <h3 className="text-sm font-semibold text-gray-900">キーワード</h3>
            <Input
              placeholder="名前・PR文で検索"
              value={filters.keyword}
              onChange={e => setFilters(prev => ({ ...prev, keyword: e.target.value }))}
            />
          </section>

          <section className="space-y-3 border-b border-gray-100 pb-4">
            <h3 className="text-sm font-semibold text-gray-900">ジャンル</h3>
            <div className="space-y-2">
              {genreOptions.map(option => (
                <label key={option} className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    className="h-5 w-5 rounded border-gray-300"
                    checked={filters.genres.includes(option)}
                    onChange={() => toggleArrayFilter('genres', option)}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </section>

          <section className="space-y-3 border-b border-gray-100 pb-4">
            <h3 className="text-sm font-semibold text-gray-900">活動エリア</h3>
            <div className="space-y-2">
              {areaOptions.map(option => (
                <label key={option} className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    className="h-5 w-5 rounded border-gray-300"
                    checked={filters.areas.includes(option)}
                    onChange={() => toggleArrayFilter('areas', option)}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </section>

          <section className="space-y-2 border-b border-gray-100 pb-4">
            <h3 className="text-sm font-semibold text-gray-900">料金目安</h3>
            <select
              value={filters.rateRange ?? ''}
              onChange={e =>
                setFilters(prev => ({
                  ...prev,
                  rateRange: e.target.value ? (e.target.value as RateRange) : undefined,
                }))
              }
              className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm"
            >
              <option value="">指定なし</option>
              <option value="under_200k">〜20万円</option>
              <option value="between_200k_500k">20〜50万円</option>
              <option value="over_500k">50万円〜</option>
              <option value="negotiable">要相談</option>
            </select>
          </section>

          <Button type="button" variant="ghost" className="w-full" onClick={handleReset}>
            条件をリセット
          </Button>
        </div>
      </aside>
    </>
  )
}
