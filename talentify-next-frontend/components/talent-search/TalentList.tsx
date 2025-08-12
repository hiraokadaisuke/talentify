import TalentCard, { Talent } from './TalentCard'

export default function TalentList({ talents, error }: { talents: Talent[]; error?: boolean }) {
  if (error) {
    return <p className="p-4">キャストを取得できませんでした。</p>
  }

  if (talents.length === 0) {
    return <p className="p-4">該当するキャストが見つかりませんでした。</p>
  }

  return (
    <>
      <p className="mb-4 text-sm text-gray-700">検索結果：{talents.length}件</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {talents.map(t => (
          <TalentCard key={t.id} talent={t} />
        ))}
      </div>
    </>
  )
}
