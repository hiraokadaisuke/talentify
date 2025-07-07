// app/talents/page.tsx

export const runtime = 'nodejs'

import Link from 'next/link'

type Talent = {
  id: string
  name: string
  email: string
}

export default async function TalentListPage() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3000'

  try {
    const res = await fetch(`${baseUrl}/api/talents`, {
      cache: 'no-store',
    })

    if (!res.ok) {
      throw new Error(`Failed to fetch: ${res.status}`)
    }

    const talents: Talent[] = await res.json()

    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">演者一覧</h1>
        <ul className="space-y-2">
          {talents.map((talent) => (
            <li key={talent.id} className="border p-3 rounded">
              <Link href={`/talents/${talent.id}`} className="text-blue-600 hover:underline">
                {talent.name}
              </Link>
              <p className="text-sm text-gray-600">{talent.email}</p>
            </li>
          ))}
        </ul>
      </div>
    )
  } catch (error) {
    console.error('API取得エラー:', error)
    return (
      <div className="p-4 text-red-600">
        <h1 className="text-xl font-bold mb-2">エラーが発生しました</h1>
        <p>演者一覧の取得に失敗しました。時間をおいて再度お試しください。</p>
      </div>
    )
  }
}
