import TalentCard from './TalentCard'
import type { PublicTalent } from '@/types/talent'
import { EmptyState } from '@/components/ui/empty-state'
import { SearchX } from 'lucide-react'

export default function TalentList({ talents }: { talents: PublicTalent[] }) {
  if (talents.length === 0) {
    return (
      <EmptyState
        illustration={<SearchX className="h-12 w-12 text-muted-foreground" />}
        title="条件に合う演者が見つかりません"
        actionHref="/search/talents"
        actionLabel="条件をリセット"
      />
    )
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-gray-700">検索結果：{talents.length}件</p>
        <div className="h-9 min-w-28 rounded-md border border-dashed border-gray-300 bg-gray-50 px-3 text-xs text-gray-400 flex items-center justify-center">
          並び替え（準備中）
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {talents.map(t => (
          <TalentCard key={t.id} talent={t} />
        ))}
      </div>
    </>
  )
}
