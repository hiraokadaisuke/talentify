'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'

interface Item {
  id: string
  fixed_date: string
  time_range?: string | null
  store_name?: string | null
}

export default function SchedulePage() {
  const supabase = createClient()
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return setLoading(false)

      const { data, error } = await supabase
        .from('offers')
        .select('id,fixed_date,time_range,store:store_id(store_name)')
        .eq('talent_id', user.id)
        .eq('status', 'confirmed')
        .not('fixed_date', 'is', null)
        .order('fixed_date', { ascending: true })

      if (!error && data) {
        const mapped = (data as any[]).map((o) => ({
          id: o.id,
          fixed_date: o.fixed_date,
          time_range: o.time_range,
          store_name: o.store?.store_name ?? '',
        }))
        setItems(mapped)
      }
      setLoading(false)
    }
    load()
  }, [supabase])

  return (
    <div className='max-w-screen-md mx-auto py-8 space-y-6'>
      <h1 className='text-2xl font-bold mb-4'>スケジュール管理</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className='space-y-2'>
          {items.length === 0 ? (
            <p className='text-sm text-muted-foreground'>確定した予定はありません</p>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className='border rounded p-3 text-sm flex justify-between'
              >
                <div>
                  <div className='font-medium'>{item.fixed_date}</div>
                  {item.time_range && (
                    <div className='text-xs text-muted-foreground'>{item.time_range}</div>
                  )}
                  {item.store_name && (
                    <div className='text-xs text-muted-foreground'>{item.store_name}</div>
                  )}
                </div>
                <Link
                  href={`/talent/offers/${item.id}`}
                  className='text-blue-600 text-xs self-center'
                >
                  詳細
                </Link>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
