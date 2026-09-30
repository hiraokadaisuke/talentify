'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AccountRolePage() {
  const router = useRouter()
  const [saving, setSaving] = useState<'store' | 'talent' | null>(null)
  const [error, setError] = useState<string | null>(null)

  const choose = async (role: 'store' | 'talent') => {
    setSaving(role)
    setError(null)
    try {
      const res = await fetch('/api/auth/claim-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      })
      const payload = await res.json()
      if (!res.ok || !payload?.next) throw new Error(payload?.error ?? 'failed')
      router.replace(payload.next)
      router.refresh()
    } catch {
      setError('登録種別の保存に失敗しました')
      setSaving(null)
    }
  }

  return (
    <main className="min-h-screen bg-[#05050d] px-5 pb-16 pt-28 text-white">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-black sm:text-4xl">利用する立場を選択</h1>
        <p className="mt-3 text-sm leading-7 text-white/60">
          以前のテスト登録などで登録種別が未設定のアカウントです。一度選ぶと、以後はその画面へ自動で進みます。
        </p>
        {error && <p className="mt-5 text-sm font-bold text-red-300">{error}</p>}
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => choose('store')}
            disabled={saving !== null}
            className="rounded-3xl border border-orange-300/30 bg-orange-400/10 p-7 text-left transition hover:-translate-y-1 disabled:opacity-50"
          >
            <p className="text-xs font-black tracking-[0.18em] text-orange-300">FOR STORES</p>
            <h2 className="mt-3 text-2xl font-black">店舗として利用</h2>
            <p className="mt-3 text-sm leading-7 text-white/60">演者検索・オファー・案件管理を利用します。</p>
          </button>
          <button
            type="button"
            onClick={() => choose('talent')}
            disabled={saving !== null}
            className="rounded-3xl border border-sky-300/30 bg-sky-400/10 p-7 text-left transition hover:-translate-y-1 disabled:opacity-50"
          >
            <p className="text-xs font-black tracking-[0.18em] text-sky-300">FOR TALENTS</p>
            <h2 className="mt-3 text-2xl font-black">演者として利用</h2>
            <p className="mt-3 text-sm leading-7 text-white/60">プロフィール・予定・案件管理を利用します。</p>
          </button>
        </div>
      </div>
    </main>
  )
}
