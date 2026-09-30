'use client'

import { useState } from 'react'
import Link from 'next/link'
import { API_BASE } from '@/lib/api'

export default function PasswordResetPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'success' | 'error' | null>(null)
  const [sending, setSending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    setStatus(null)
    try {
      const csrfRes = await fetch(`${API_BASE ?? ''}/api/csrf-token`, { credentials: 'include' })
      if (!csrfRes.ok) throw new Error('csrf')
      const { csrfToken } = await csrfRes.json()
      const res = await fetch(`${API_BASE ?? ''}/api/password-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
        credentials: 'include',
        body: JSON.stringify({ email }),
      })
      if (!res.ok) throw new Error('failed')
      setStatus('success')
    } catch {
      setStatus('error')
    } finally {
      setSending(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#05050d] px-5 pb-16 pt-28 text-white">
      <form onSubmit={handleSubmit} className="mx-auto max-w-md rounded-3xl border border-white/10 bg-white/[0.06] p-7">
        <h1 className="text-2xl font-black">パスワードを再設定</h1>
        <p className="mt-2 text-sm leading-7 text-white/60">
          登録メールアドレスへ再設定用リンクを送信します。
        </p>
        <label className="mt-6 block text-sm font-bold">
          メールアドレス
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-2 w-full rounded-xl bg-white p-3 text-black" required />
        </label>
        {status === 'error' && <p className="mt-4 text-sm font-bold text-red-300">送信に失敗しました。時間をおいて再度お試しください。</p>}
        {status === 'success' && <p className="mt-4 text-sm font-bold text-emerald-300">該当するアカウントがある場合、再設定メールを送信しました。</p>}
        <button disabled={sending} className="mt-6 h-12 w-full rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 font-black disabled:opacity-50">
          {sending ? '送信中...' : '再設定メールを送る'}
        </button>
        <Link href="/login" className="mt-5 block text-center text-sm text-white/60 underline underline-offset-4">ログインへ戻る</Link>
      </form>
    </main>
  )
}
