'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { format, parseISO } from 'date-fns'
import Link from 'next/link'

interface Offer {
  id: string
  date: string
  second_date?: string | null
  third_date?: string | null
  fixed_date?: string | null
  message: string
  status: string | null
  created_at?: string | null
  talent_stage_name?: string | null
}

export default function StoreOfferDetailPage() {
  const params = useParams<{ id: string }>()
  const supabase = createClient()
  const [offer, setOffer] = useState<Offer | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('offers')
        .select('id,date,second_date,third_date,fixed_date,message,status,created_at,talents(stage_name)')
        .eq('id', params.id)
        .single()

      if (!error && data) {
        const talent = (data as any).talents || {}
        const o = { ...(data as any), talent_stage_name: talent.stage_name }
        delete o.talents
        setOffer(o as Offer)
      }
    }
    load()
  }, [params.id, supabase])

  const confirmDate = async (d: string) => {
    if (!offer) return
    const res = await fetch(`/api/offers/${offer.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'confirmed', fixed_date: d })
    })
    if (res.ok) {
      setOffer({ ...offer, status: 'confirmed', fixed_date: d })
      setToast('スケジュールを確定しました')
      setTimeout(() => setToast(null), 3000)
    } else {
      setToast('更新に失敗しました')
      setTimeout(() => setToast(null), 3000)
    }
  }

  if (!offer) return <p className='p-4'>Loading...</p>

  const dateItems = [
    { label: '候補日1', value: offer.date },
    { label: '候補日2', value: offer.second_date },
    { label: '候補日3', value: offer.third_date }
  ]

  return (
    <div className='max-w-screen-md mx-auto p-6 space-y-4'>
      <Link href='/store/offers' className='text-sm underline'>← オファー一覧へ戻る</Link>
      <h1 className='text-xl font-bold'>オファー詳細</h1>
      <div className='space-y-2 text-sm'>
        {offer.talent_stage_name && <div>演者: {offer.talent_stage_name}</div>}
        {offer.created_at && <div>作成日: {offer.created_at.slice(0,10)}</div>}
        <div className='whitespace-pre-wrap'>{offer.message}</div>
      </div>
      <div className='space-y-2'>
        {dateItems.map((item, i) => (
          item.value ? (
            <div key={i} className='flex items-center gap-2'>
              <span>{item.label}: {format(parseISO(item.value), 'yyyy-MM-dd')}</span>
              {offer.fixed_date === item.value && <Badge>確定日</Badge>}
              {!offer.fixed_date && offer.status === 'accepted' && (
                <Button size='sm' onClick={() => confirmDate(item.value!)}>
                  この日で確定
                </Button>
              )}
            </div>
          ) : null
        ))}
      </div>
      {offer.fixed_date && (
        <div className='text-green-600'>確定日: {format(parseISO(offer.fixed_date), 'yyyy-MM-dd')}</div>
      )}
      {toast && (
        <div className='fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded shadow'>
          {toast}
        </div>
      )}
    </div>
  )
}
