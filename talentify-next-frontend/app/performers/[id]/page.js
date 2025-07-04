'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000'

export default function PerformerDetailPage({ params }) {
  const { id } = params
  const [talent, setTalent] = useState(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const fetchTalent = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/talents/${id}`, {
          credentials: 'include', // include cookies for authenticated APIs
        })
        if (res.status === 404) {
          setNotFound(true)
          return
        }
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        setTalent(data)
      } catch (e) {
        console.error(e)
      }
    }
    fetchTalent()
  }, [id])

  if (notFound) {
    return (
      <main className="max-w-3xl mx-auto p-4">
        <p>演者が見つかりませんでした。</p>
        <Link href="/performers" className="text-blue-600 underline">
          演者一覧に戻る
        </Link>
      </main>
    )
  }

  if (!talent) {
    return (
      <main className="max-w-3xl mx-auto p-4">
        <p>Loading...</p>
      </main>
    )
  }

  return (
    <main className="max-w-3xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">{talent.name}</h1>
      {talent.skills && talent.skills.length > 0 && (
        <p>
          <span className="font-medium">スキル: </span>
          {talent.skills.join(', ')}
        </p>
      )}
      <p>
        <span className="font-medium">経験年数: </span>
        {talent.experienceYears}年
      </p>
      {talent.bio && (
        <section>
          <h2 className="font-medium">自己紹介</h2>
          <p>{talent.bio}</p>
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
      <Link href="/performers" className="text-blue-600 underline">
        演者一覧に戻る
      </Link>
    </main>
  )
}
