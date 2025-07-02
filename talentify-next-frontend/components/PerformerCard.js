'use client'
import Image from 'next/image'
import Link from 'next/link'

export default function PerformerCard({ talent }) {
  return (
    <div className="border rounded p-4 flex flex-col">
      <div className="flex items-center mb-2">
        <div className="w-16 h-16 bg-gray-200 rounded-full mr-3" />
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
        {talent.experience_years}年
      </p>
      <div className="mt-auto flex space-x-2">
        <Link
          href={`/performers/${talent.id}`}
          className="flex-1 py-1 border rounded text-center hover:bg-gray-50"
        >
          詳細を見る
        </Link>
        <button className="flex-1 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">オファーを送る</button>
      </div>
    </div>
  )
}
