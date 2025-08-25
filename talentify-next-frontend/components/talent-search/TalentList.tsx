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
      <p className="mb-4 text-sm text-gray-700">検索結果：{talents.length}件</p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
        {talents.map(t => (
          <TalentCard key={t.id} talent={t} />
        ))}
      </div>
    </>
  )
}
