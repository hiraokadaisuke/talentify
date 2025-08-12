'use client'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export type SearchFilters = {
  keyword: string
  genre: string
  area: string
}

const GENRES = ['バラエティ', 'アイドル', 'お笑い', 'レポーター']
const AREAS = ['東京', '大阪', '福岡', '北海道']

export default function TalentSearchForm({ onSearch }: { onSearch: (f: SearchFilters) => void }) {
  const [keyword, setKeyword] = useState('')
  const [genre, setGenre] = useState('')
  const [area, setArea] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch({ keyword, genre, area })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2 md:grid md:grid-cols-3 md:gap-3 md:space-y-0">
      <Input
        placeholder="キーワード"
        value={keyword}
        onChange={e => setKeyword(e.target.value)}
        className="md:col-span-1"
      />
      <select value={genre} onChange={e => setGenre(e.target.value)} className="h-9 rounded-md border px-2 md:col-span-1">
        <option value="">ジャンル</option>
        {GENRES.map(g => (
          <option key={g} value={g}>{g}</option>
        ))}
      </select>
      <select value={area} onChange={e => setArea(e.target.value)} className="h-9 rounded-md border px-2 md:col-span-1">
        <option value="">居住地</option>
        {AREAS.map(a => (
          <option key={a} value={a}>{a}</option>
        ))}
      </select>
      <div className="md:col-span-3 text-right">
        <Button type="submit">検索</Button>
      </div>
    </form>
  )
}
