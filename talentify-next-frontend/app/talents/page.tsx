// app/talents/page.tsx
import Link from 'next/link'

type Talent = {
  id: string
  name: string
  email: string
}

export default async function TalentListPage() {
  const res = await fetch('http://localhost:3000/api/talents', {
    cache: 'no-store',
  })

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
}
