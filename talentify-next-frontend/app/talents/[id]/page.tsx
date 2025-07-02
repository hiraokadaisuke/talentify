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
  const res = await fetch(`http://localhost:3000/api/talents/${params.id}`, {
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
