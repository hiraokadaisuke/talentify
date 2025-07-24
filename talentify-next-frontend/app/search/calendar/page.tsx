'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import TalentList from '@/components/talent-search/TalentList'
import { Talent } from '@/components/talent-search/TalentCard'

const SAMPLE_TALENTS: Talent[] = [
  {
    id: 1,
    name: '山田 花子',
    genre: 'バラエティ',
    gender: '女性',
    ageGroup: '20代',
    location: '東京',
    profile: '元気いっぱいの女性演者です。',
    avatar: '/avatar-default.svg',
    agency: 'ABCプロダクション',
  },
  {
    id: 2,
    name: '田中 太郎',
    genre: 'スロット専門',
    gender: '男性',
    ageGroup: '30代',
    location: '大阪',
    profile: 'スロットならお任せください。',
    avatar: '/avatar-default.svg',
    agency: 'フリー',
  },
]

export default function CalendarSearchPage() {
  const [date, setDate] = useState('')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [area, setArea] = useState('')
  const [genre, setGenre] = useState('')
  const [results, setResults] = useState<Talent[]>(SAMPLE_TALENTS)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const filtered = SAMPLE_TALENTS.filter(
      (t) => (!area || t.location === area) && (!genre || t.genre === genre),
    )
    setResults(filtered)
  }

  return (
    <main className="max-w-5xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">日時から演者を探す</h1>
      <form
        onSubmit={handleSearch}
        className="space-y-2 md:grid md:grid-cols-5 md:gap-3 md:space-y-0"
      >
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="md:col-span-1"
        />
        <Input
          type="time"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          className="md:col-span-1"
        />
        <Input
          type="time"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          className="md:col-span-1"
        />
        <select
          value={area}
          onChange={(e) => setArea(e.target.value)}
          className="h-9 rounded-md border px-2 md:col-span-1"
        >
          <option value="">エリア</option>
          <option value="東京">東京</option>
          <option value="大阪">大阪</option>
        </select>
        <select
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          className="h-9 rounded-md border px-2 md:col-span-1"
        >
          <option value="">ジャンル</option>
          <option value="バラエティ">バラエティ</option>
          <option value="スロット専門">スロット専門</option>
        </select>
        <div className="md:col-span-5 text-right">
          <Button type="submit">検索</Button>
        </div>
      </form>
      <TalentList talents={results} />
    </main>
  )
}
