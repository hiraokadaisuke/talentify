'use client'

import { Button } from '@/components/ui/button'

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error)
  return (
    <div className="space-y-4 p-4">
      <p className="text-sm text-red-600">データの取得に失敗しました。</p>
      <Button onClick={() => reset()}>再試行</Button>
    </div>
  )
}
