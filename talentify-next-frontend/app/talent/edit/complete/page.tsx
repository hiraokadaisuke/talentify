'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function TalentEditComplete() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6 space-y-6 lg:mx-auto lg:mt-8 lg:h-auto lg:max-w-2xl lg:rounded-2xl lg:border lg:border-slate-200 lg:bg-white lg:p-10 lg:shadow-[0_8px_24px_rgba(15,23,42,.05)]">
      <h1 className="text-2xl font-bold">登録が完了しました！</h1>
      <Link href="/talent/dashboard">
        <Button>ダッシュボードへ進む</Button>
      </Link>
    </div>
  )
}
