'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { useUserRole } from '@/utils/useRole'
import { StarRating } from '@/components/StarRating'
import { FaTwitter, FaInstagram } from 'react-icons/fa'

type Talent = {
  id: string
  name: string
  profile: string
  rating?: number
  video_url?: string
  sns_links?: {
    twitter?: string
    instagram?: string
  }
  user_id?: string
}

type Props = {
  id: string
}

export default function TalentDetailPageClient({ id }: Props) {
  const supabase = createClient()
  const [talent, setTalent] = useState<Talent | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const { role, loading: roleLoading } = useUserRole()

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`/api/talents/${id}`)
      if (res.ok) {
        const data = await res.json()
        setTalent(data)
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserId(user.id)
    }

    if (id) fetchData()
  }, [id, supabase])

  if (!talent || roleLoading) return <div>読み込み中...</div>

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-2">{talent.name}</h1>
      <p className="mb-4">{talent.profile}</p>

      {talent.rating !== undefined && (
        <div className="mt-2">
          <p className="text-sm text-gray-700 mb-1">評価</p>
          <StarRating rating={talent.rating} />
        </div>
      )}

      {talent.sns_links && (
        <div className="flex gap-4 mt-4">
          {talent.sns_links.twitter && (
            <a href={talent.sns_links.twitter} target="_blank" rel="noopener noreferrer">
              <FaTwitter className="w-6 h-6 text-blue-500" />
            </a>
          )}
          {talent.sns_links.instagram && (
            <a href={talent.sns_links.instagram} target="_blank" rel="noopener noreferrer">
              <FaInstagram className="w-6 h-6 text-pink-500" />
            </a>
          )}
        </div>
      )}

      {talent.video_url && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">自己紹介動画</h3>
          <div className="aspect-video w-full rounded overflow-hidden">
            <iframe
              width="100%"
              height="315"
              src={talent.video_url.replace('watch?v=', 'embed/')}
              title="自己紹介動画"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          </div>
        </div>
      )}

      <div className="mt-6 space-y-2">
        {role === 'store' && (
  <Link href={`/talents/${talent.id}/offer`}>
    <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
      オファーを送る
    </button>
  </Link>
)}

{role === 'talent' && userId === talent.id && (
  <button
    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
    onClick={() => (window.location.href = '/talent/profile/edit')}
  >
    プロフィールを編集する
  </button>
)}

      </div>
    </div>
  )
}
