import TalentCard from './TalentCard'
import type { PublicTalent } from '@/types/talent'

export default function TalentList({ talents }: { talents: PublicTalent[] }) {
  return (
    <>
      <p className="mb-4 text-sm text-gray-700">検索結果：{talents.length}件</p>
      {talents.length === 0 ? (
        <p className="p-4">検索条件に一致するキャストがいません</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {talents.map(t => (
            <TalentCard key={t.id} talent={t} />
          ))}
        </div>
      )}
    </>
  )
}
