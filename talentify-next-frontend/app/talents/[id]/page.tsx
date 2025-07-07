// app/talents/[id]/page.tsx

export const runtime = 'nodejs'

import { notFound } from 'next/navigation'

type Talent = {
  id: string
  name: string
  email: string
  profile: string
}

export default async function TalentDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3000'

  try {
    const res = await fetch(`${baseUrl}/api/talents/${params.id}`, {
      cache: 'no-store',
    })

    if (!res.ok) return notFound()

    const talent: Talent = await res.json()

    return (
      <div className="p-4">
        <h1 className="text-xl font-bold">{talent.name}</h1>
        <p className="text-gray-700 mb-2">{talent.email}</p>
        <p className="text-gray-800 whitespace-pre-line">{talent.profile}</p>
      </div>
    )
  } catch (error) {
    console.error('API取得エラー:', error)
    return notFound()
  }
}
