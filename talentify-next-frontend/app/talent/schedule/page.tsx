'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { getTalentSchedule, type TalentSchedule } from '@/utils/getTalentSchedule'
import { toast } from 'sonner'
import { formatJaDateTimeWithWeekday } from '@/utils/formatJaDateTimeWithWeekday'

export default function SchedulePage() {
  const [items, setItems] = useState<TalentSchedule[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getTalentSchedule().then((data) => {
      setItems(data)
      setLoading(false)
      if (
        data.length > 0 &&
        typeof window !== 'undefined' &&
        window.location.search.includes('confirmed=1')
      ) {
        toast.success('出演スケジュールが確定しました')
      }
    })
  }, [])

  return (
    <div className='max-w-screen-md mx-auto py-8 space-y-6'>
      <h1 className='text-2xl font-bold mb-4'>スケジュール管理</h1>

      <Card>
        <CardHeader>
          <CardTitle>今後の出演予定</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4 text-sm'>
          {loading && <p>Loading...</p>}
          {!loading && items.length === 0 && <p className='text-muted-foreground'>確定した予定はありません</p>}
          {items.map((item) => (
            <div
              key={item.id}
              className='flex justify-between items-center border rounded px-4 py-2'
            >
              <div>
                <p className='font-medium'>{formatJaDateTimeWithWeekday(item.date)}</p>
                {item.store_name && (
                  <p className='text-xs text-gray-500'>店舗: {item.store_name}</p>
                )}
                {item.time_range && (
                  <p className='text-xs text-gray-500'>{item.time_range}</p>
                )}
              </div>
              <div className='flex items-center gap-2'>
                <Badge>確定済</Badge>
                <Link href={`/talent/offers/${item.id}`} className='text-xs text-blue-600 underline'>詳細</Link>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      {/* Toasts are handled globally */}
    </div>
  )
}
