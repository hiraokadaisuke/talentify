'use client'
import Image from 'next/image'
import Link from 'next/link'

export default function TalentCard({ talent }) {
  return (
    <div className="border rounded p-4 flex flex-col">
      <div className="flex items-center mb-2">
        <div className="w-16 h-16 rounded-full overflow-hidden mr-3 bg-gray-100">
          {talent.avatar_url ? (
            <Image
              src={talent.avatar_url}
              alt={`${talent.name}の画像`}
              width={64}
              height={64}
              className="object-cover w-full h-full"
            />
          ) : null}
        </div>
        <h2 className="text-lg font-semibold">{talent.name}</h2>
      </div>
      {talent.skills && talent.skills.length > 0 && (
        <p className="text-sm mb-2">
          <span className="font-medium">スキル: </span>
          {talent.skills.join(', ')}
        </p>
      )}
      <p className="text-sm mb-4">
        <span className="font-medium">経験年数: </span>
        {talent.experienceYears != null ? `${talent.experienceYears}年` : '未登録'}
      </p>
      <div className="mt-auto flex space-x-2">
        <Link
          href={`/talents/${talent.id}`}
          className="flex-1 py-1 border rounded text-center hover:bg-gray-50"
        >
          詳細を見る
        </Link>
        <Link href={`/talents/${talent.id}/offer`} className="flex-1">
          <button className="w-full py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
            オファーを送る
          </button>
        </Link>
      </div>
    </div>
  )
}
