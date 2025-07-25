'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function TalentEditComplete() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6 space-y-6">
      <h1 className="text-2xl font-bold">登録が完了しました！</h1>
      <Link href="/talent/dashboard">
        <Button>ダッシュボードへ進む</Button>
      </Link>
    </div>
  )
}
