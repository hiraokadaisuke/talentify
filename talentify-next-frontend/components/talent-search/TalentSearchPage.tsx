'use client'
import { useState } from 'react'
import TalentSearchForm, { SearchFilters } from './TalentSearchForm'
import TalentList from './TalentList'
import { Talent } from './TalentCard'

const SAMPLE_TALENTS: Talent[] = [
  {
    id: 1,
    name: '山田 花子',
    genre: 'アイドル',
    gender: '女性',
    ageGroup: '20代',
    location: '東京',
    bio: '歌とダンスが得意です。明るく元気に盛り上げます！',
    agency: 'ABCプロダクション',
    avatar: 'https://example.com/avatar1.jpg',
  },
  {
    id: 2,
    name: '佐藤 太郎',
    genre: 'お笑い',
    gender: '男性',
    ageGroup: '30代',
    location: '大阪',
    bio: '関西弁で楽しくトークします。テレビ出演経験あり。',
    agency: 'XYZエンターテインメント',
    avatar: 'https://example.com/avatar2.jpg',
  },
  {
    id: 3,
    name: '鈴木 一郎',
    genre: 'レポーター',
    gender: '男性',
    ageGroup: '40代',
    location: '福岡',
    bio: '冷静な実況レポートが得意です。全国各地の取材経験豊富。',
    avatar: 'https://example.com/avatar3.jpg',
  },
  {
    id: 4,
    name: '高橋 真美',
    genre: 'バラエティ',
    gender: '女性',
    ageGroup: '30代',
    location: '東京',
    bio: 'バラエティ番組を中心に活動中。明るさが武器です。',
    avatar: 'https://example.com/avatar4.jpg',
  },
]

const ITEMS_PER_PAGE = 6

export default function TalentSearchPage() {
  const [talents] = useState<Talent[]>(SAMPLE_TALENTS)
  const [results, setResults] = useState<Talent[]>(SAMPLE_TALENTS)
  const [page, setPage] = useState(1)

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
