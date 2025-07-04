// app/talents/[id]/page.tsx
import { notFound } from 'next/navigation'

type Talent = {
  id: string
  name: string
  email: string
  profile: string | null
  bio: string | null
  skills: string[] | null
  social_links: string[] | null
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

  const talent: Talent | null = await res.json()
  if (!talent) return notFound()

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">{talent.name}</h1>
      <p>{talent.email}</p>
      {talent.bio && (
        <section>
          <h2 className="font-medium">自己紹介</h2>
          <p>{talent.bio}</p>
        </section>
      )}
      {talent.skills && talent.skills.length > 0 && (
        <section>
          <h2 className="font-medium">スキル</h2>
          <ul className="list-disc pl-5 space-y-1">
            {talent.skills.map((skill) => (
              <li key={skill}>{skill}</li>
            ))}
          </ul>
        </section>
      )}
      {talent.social_links && talent.social_links.length > 0 && (
        <section>
          <h2 className="font-medium">SNS</h2>
          <ul className="list-disc pl-5 space-y-1">
            {talent.social_links.map((link) => (
              <li key={link}>
                <a
                  href={link}
                  className="text-blue-600 underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
