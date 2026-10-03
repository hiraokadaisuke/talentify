'use client'

import { Button } from '@/components/ui/button'

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error)
  return (
    <div className="space-y-4 p-4 lg:mx-auto lg:max-w-2xl lg:rounded-2xl lg:border lg:border-red-200 lg:bg-white lg:p-8 lg:shadow-[0_8px_24px_rgba(15,23,42,.05)]">
      <p className="text-sm text-red-600">店舗情報を取得できませんでした。</p>
      <Button onClick={() => reset()}>再試行</Button>
    </div>
  )
}
