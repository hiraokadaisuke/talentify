'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/utils/supabase/client'
import { useUserRole } from '@/utils/useRole'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FaTwitter, FaInstagram, FaYoutube } from 'react-icons/fa'

type Talent = {
  id: string
  stage_name: string
  birthdate?: string | null
  gender?: string | null
  residence?: string | null
  birthplace?: string | null
  height?: number | null
  agency?: string | null
  agency_url?: string | null
  profile_photo?: string | null
  photos?: string[]
  hobby?: string | null
  certifications?: string | null
  notes?: string | null
  media_appearance?: string | null
  twitter?: string | null
  instagram?: string | null
  youtube?: string | null
  user_id?: string | null
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

  const calcAge = (d: string) => {
    const today = new Date()
    const birth = new Date(d)
    let age = today.getFullYear() - birth.getFullYear()
    const m = today.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
    return age
  }

  const age = talent.birthdate ? calcAge(talent.birthdate) : null

  return (
    <main className="max-w-3xl mx-auto p-4 space-y-6">
      <Card>
        <CardContent className="flex flex-col sm:flex-row gap-4 items-start">
          <div className="w-full sm:w-48 h-48 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
            {talent.profile_photo && (
              <Image
                src={talent.profile_photo}
                alt={talent.stage_name}
                width={192}
                height={192}
                className="object-cover w-full h-full"
              />
            )}
          </div>
          <div className="flex-1 space-y-1 text-sm">
            <h1 className="text-2xl font-bold">{talent.stage_name}</h1>
            {age != null && <p>年齢: {age}</p>}
            {talent.gender && <p>性別: {talent.gender}</p>}
            {talent.residence && <p>居住地: {talent.residence}</p>}
            {talent.birthplace && <p>出身地: {talent.birthplace}</p>}
            {talent.height && <p>身長: {talent.height}cm</p>}
            {talent.agency && (
              <p>
                所属:{' '}
                {talent.agency_url ? (
                  <a
                    href={talent.agency_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    {talent.agency}
                  </a>
                ) : (
                  talent.agency
                )}
              </p>
            )}
            <div className="flex gap-3 mt-2 text-lg">
              {talent.twitter && (
                <a href={talent.twitter} target="_blank" rel="noopener noreferrer">
                  <FaTwitter />
                </a>
              )}
              {talent.instagram && (
                <a href={talent.instagram} target="_blank" rel="noopener noreferrer">
                  <FaInstagram />
                </a>
              )}
              {talent.youtube && (
                <a href={talent.youtube} target="_blank" rel="noopener noreferrer">
                  <FaYoutube />
                </a>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {talent.photos && talent.photos.length > 0 && (
        <Card>
          <CardContent>
            <div className="flex overflow-x-auto gap-3 pb-2">
              {talent.photos.map((p, i) => (
                <div
                  key={i}
                  className="flex-none w-40 h-40 rounded-lg overflow-hidden bg-gray-100"
                >
                  <Image
                    src={p}
                    alt={`${talent.stage_name} ${i + 1}`}
                    width={160}
                    height={160}
                    className="object-cover w-full h-full"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="space-y-2 text-sm">
          {talent.hobby && <p>趣味: {talent.hobby}</p>}
          {talent.certifications && <p>資格: {talent.certifications}</p>}
          {talent.notes && <p>備考: {talent.notes}</p>}
          {talent.media_appearance && (
            <div>
              <p className="font-semibold">メディア出演歴</p>
              <p className="whitespace-pre-line">{talent.media_appearance}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-2">
        {role === 'store' && (
          <Button asChild>
            <Link href={`/talents/${talent.id}/offer`}>オファーを送る</Link>
          </Button>
        )}
        {role === 'talent' && userId === talent.id && (
          <Button onClick={() => (window.location.href = '/talent/edit')}>
            プロフィールを編集する
          </Button>
        )}
      </div>
    </main>
  )
}
