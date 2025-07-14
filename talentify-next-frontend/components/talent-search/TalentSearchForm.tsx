'use client'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export type SearchFilters = {
  keyword: string
  genre: string
  gender: string
  age: string
  location: string
}

const GENRES = ['バラエティ', 'アイドル', 'お笑い', 'レポーター']
const GENDERS = ['男性', '女性', 'その他']
const AGES = ['10代', '20代', '30代', '40代', '50代以上']
const LOCATIONS = ['東京', '大阪', '福岡', '北海道']

export default function TalentSearchForm({ onSearch }: { onSearch: (f: SearchFilters) => void }) {
  const [keyword, setKeyword] = useState('')
  const [genre, setGenre] = useState('')
  const [gender, setGender] = useState('')
  const [age, setAge] = useState('')
  const [location, setLocation] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch({ keyword, genre, gender, age, location })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2 md:grid md:grid-cols-5 md:gap-3 md:space-y-0">
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
      <select value={gender} onChange={e => setGender(e.target.value)} className="h-9 rounded-md border px-2 md:col-span-1">
        <option value="">性別</option>
        {GENDERS.map(g => (
          <option key={g} value={g}>{g}</option>
        ))}
      </select>
      <select value={age} onChange={e => setAge(e.target.value)} className="h-9 rounded-md border px-2 md:col-span-1">
        <option value="">年齢層</option>
        {AGES.map(a => (
          <option key={a} value={a}>{a}</option>
        ))}
      </select>
      <select value={location} onChange={e => setLocation(e.target.value)} className="h-9 rounded-md border px-2 md:col-span-1">
        <option value="">居住地</option>
        {LOCATIONS.map(l => (
          <option key={l} value={l}>{l}</option>
        ))}
      </select>
      <div className="md:col-span-5 text-right">
        <Button type="submit">検索</Button>
      </div>
    </form>
  )
}
