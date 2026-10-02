'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { API_BASE } from '@/lib/api'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = useMemo(() => createClient(), [])
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) router.replace(searchParams.get('redirectedFrom') ?? '/dashboard')
    }
    void checkUser()
  }, [router, searchParams, supabase])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    setError(null)

    try {
      const csrfRes = await fetch(`${API_BASE ?? ''}/api/csrf-token`, { credentials: 'include' })
      if (!csrfRes.ok) throw new Error('csrf')
      const { csrfToken } = await csrfRes.json()

      const res = await fetch(`${API_BASE ?? ''}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) {
        setError('メールアドレスまたはパスワードを確認してください')
        return
      }

      window.location.assign(searchParams.get('redirectedFrom') ?? '/dashboard')
    } catch {
      setError('ログインに失敗しました。時間をおいて再度お試しください')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#05050d] px-5 pb-16 pt-28 text-white">
      <div className="mx-auto max-w-md">
        <div className="text-center">
          <Link href="/" className="inline-flex">
            <img src="/brand/raiten-navi-logo.svg" alt="来店ナビ" className="h-12 w-auto" />
          </Link>
          <h1 className="mt-6 text-3xl font-black">ログイン</h1>
          {searchParams.get('passwordReset') === '1' && (
            <p className="mt-4 rounded-xl bg-emerald-500/10 p-3 text-sm font-bold text-emerald-300">
              パスワードを更新しました。新しいパスワードでログインしてください。
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="mt-7 rounded-3xl border border-white/10 bg-white/[0.06] p-7">
          <label className="block text-sm font-bold text-white/80">
            メールアドレス
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-2 w-full rounded-xl bg-white p-3 text-black" required />
          </label>
          <label className="mt-5 block text-sm font-bold text-white/80">
            パスワード
            <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} className="mt-2 w-full rounded-xl bg-white p-3 text-black" required />
          </label>
          <label className="mt-3 flex items-center gap-2 text-xs text-white/55">
            <input type="checkbox" checked={showPassword} onChange={() => setShowPassword(v => !v)} />
            パスワードを表示
          </label>
          {error && <p className="mt-4 text-sm font-bold text-red-300">{error}</p>}
          <button disabled={submitting} className="mt-6 h-12 w-full rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 font-black disabled:opacity-50">
            {submitting ? 'ログイン中...' : 'ログイン'}
          </button>
          <Link href="/password-reset" className="mt-5 block text-center text-sm font-bold text-white/60 underline underline-offset-4 hover:text-white">
            パスワードを忘れた方
          </Link>
        </form>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Link href="/register?role=store" className="rounded-2xl border border-orange-300/30 bg-orange-400/10 p-4 text-center text-sm font-black text-orange-200">
            店舗として登録
          </Link>
          <Link href="/register?role=talent" className="rounded-2xl border border-sky-300/30 bg-sky-400/10 p-4 text-center text-sm font-black text-sky-200">
            演者として登録
          </Link>
        </div>
      </div>
    </main>
  )
}
