'use client'

import { FaTwitter, FaInstagram } from 'react-icons/fa'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { StarRating } from '@/components/StarRating'
import { createClient } from '@/utils/supabase/client'
import { useUserRole } from '@/utils/useRole'

type Performer = {
  id: string
  name: string
  profile: string
  rating?: number
  video_url?: string
  sns_links?: {
    twitter?: string
    instagram?: string
  }
  user_id?: string // 必要に応じて
}

export default function PerformerDetailPage() {
  const { id } = useParams()
  const supabase = createClient()
  const [performer, setPerformer] = useState<Performer | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const { role, loading: roleLoading } = useUserRole()

  useEffect(() => {
    const fetchData = async () => {
      // 演者データ取得
      const res = await fetch(`/api/talents/${id}`)
      if (res.ok) {
        const data = await res.json()
        setPerformer(data)
      }

      // ログインユーザーのID取得
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) setUserId(user.id)
    }

    if (id) fetchData()
  }, [id, supabase])

  if (!performer || roleLoading) return <div>読み込み中...</div>

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-2">{performer.name}</h1>
      <p className="mb-4">{performer.profile}</p>

      {performer.rating !== undefined && (
        <div className="mt-2">
          <p className="text-sm text-gray-700 mb-1">評価</p>
          <StarRating rating={performer.rating} />
        </div>
      )}

      {performer.sns_links && (
        <div className="flex gap-4 mt-4">
          {performer.sns_links.twitter && (
            <a href={performer.sns_links.twitter} target="_blank" rel="noopener noreferrer">
              <FaTwitter className="w-6 h-6 text-blue-500" />
            </a>
          )}
          {performer.sns_links.instagram && (
            <a href={performer.sns_links.instagram} target="_blank" rel="noopener noreferrer">
              <FaInstagram className="w-6 h-6 text-pink-500" />
            </a>
          )}
        </div>
      )}

      {performer.video_url && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">自己紹介動画</h3>
          <div className="aspect-video w-full rounded overflow-hidden">
            <iframe
              width="100%"
              height="315"
              src={performer.video_url.replace('watch?v=', 'embed/')}
              title="自己紹介動画"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          </div>
        </div>
      )}

      {/* 🎯 ロール別のUI出し分け */}
      <div className="mt-6 space-y-2">
        {role === 'store' && (
          <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
            オファーを送る
          </button>
        )}

        {role === 'performer' && userId === performer.id && (
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => (window.location.href = '/performer/profile/edit')}
          >
            プロフィールを編集する
          </button>
        )}
      </div>
    </div>
  )
}
