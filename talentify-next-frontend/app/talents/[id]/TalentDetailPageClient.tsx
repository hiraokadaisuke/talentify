'use client'


import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/utils/supabase/client'
import { useUserRole } from '@/utils/useRole'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
  const [showForm, setShowForm] = useState(false)
  const [date1, setDate1] = useState('')
  const [date2, setDate2] = useState('')
  const [date3, setDate3] = useState('')
  const [timeSlot, setTimeSlot] = useState('')
  const [remarks, setRemarks] = useState('')
  const [agree, setAgree] = useState(false)
  const [submitted, setSubmitted] = useState(false)

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      alert('ログインしてください')
      return
    }

    const message = `第1希望:${date1}\n第2希望:${date2}\n第3希望:${date3}\n希望時間帯:${timeSlot}\n備考:${remarks}`

    const { error } = await supabase.from('offers').insert([
      { user_id: user.id, talent_id: id, message, date: date1, status: 'pending' }
    ])
    if (error) {
      alert('送信に失敗しました')
      return
    }

    setSubmitted(true)
  }

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
          <>
            {!submitted ? (
              <>
                <Button onClick={() => setShowForm(v => !v)} className="w-full">
                  {showForm ? 'フォームを閉じる' : 'オファーする'}
                </Button>
                {showForm && (
                  <form onSubmit={handleSubmit} className="space-y-4 border p-4 rounded">
                    <div>
                      <label className="block text-sm font-medium mb-1">来店希望日(第1希望)</label>
                      <Input type="date" value={date1} onChange={e => setDate1(e.target.value)} required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">来店希望日(第2希望)</label>
                      <Input type="date" value={date2} onChange={e => setDate2(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">来店希望日(第3希望)</label>
                      <Input type="date" value={date3} onChange={e => setDate3(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">希望時間帯</label>
                      <Input value={timeSlot} onChange={e => setTimeSlot(e.target.value)} placeholder="例: 10:00〜18:00" />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        id="agree"
                        type="checkbox"
                        checked={agree}
                        onChange={e => setAgree(e.target.checked)}
                        required
                      />
                      <label htmlFor="agree" className="text-sm">出演条件に同意します</label>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">備考（任意）</label>
                      <Textarea value={remarks} onChange={e => setRemarks(e.target.value)} />
                    </div>
                    <Button type="submit" disabled={!agree}>送信</Button>
                  </form>
                )}
              </>
            ) : (
              <div className="p-4 border rounded text-sm">
                <p>送信完了しました。オファーステータスはダッシュボードで確認できます。</p>
              </div>
            )}
          </>
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
