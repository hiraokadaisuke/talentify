// app/talents/[id]/page.tsx
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

  const res = await fetch(`${baseUrl}/api/talents/${params.id}`, {
    cache: 'no-store',
  })

  if (!res.ok) return notFound()

  const talent: Talent = await res.json()

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">{talent.name}</h1>
      <p>{talent.email}</p>
      <p>{talent.profile}</p>
    </div>
  )
}
