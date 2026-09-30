'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { API_BASE } from '@/lib/api'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session) {
        router.replace(searchParams.get('redirectedFrom') ?? '/dashboard')
      }
    }

    checkSession()

    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      if (session) {
        router.replace(searchParams.get('redirectedFrom') ?? '/dashboard')
      }
    })

    return (
    <main className="min-h-[calc(100vh-4rem)] bg-[#05050d] px-5 pb-16 pt-28 text-white">
      <div className="mx-auto w-full max-w-md">
        <div className="text-center">
          <Link href="/" className="inline-flex">
            <img src="/images/lp/logo.png" alt="Talentify" className="h-10 w-auto" />
          </Link>
          <h1 className="mt-6 text-3xl font-black">ログイン</h1>
          <p className="mt-2 text-sm text-white/55">登録済みのアカウントでTalentifyを利用します。</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 rounded-3xl border border-white/10 bg-white/[0.06] p-6 shadow-2xl sm:p-8">
          <label className="block text-sm font-bold text-white/80">
            メールアドレス
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/15 bg-white px-3 py-3 text-slate-900 outline-none focus:border-pink-400"
              required
            />
          </label>
          <label className="mt-5 block text-sm font-bold text-white/80">
            パスワード
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/15 bg-white px-3 py-3 text-slate-900 outline-none focus:border-pink-400"
              required
            />
          </label>
          <label className="mt-4 inline-flex items-center text-sm text-white/60">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
              className="mr-2"
            />
            パスワードを表示
          </label>
          {error && <p className="mt-4 rounded-xl bg-red-500/10 p-3 text-sm font-bold text-red-300">{error}</p>}
          <button
            type="submit"
            className="mt-6 h-12 w-full rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 font-black text-white shadow-[0_0_20px_rgba(236,72,153,.25)]"
          >
            ログイン
          </button>
        </form>

        <div className="mt-7">
          <p className="text-center text-sm font-bold text-white/65">初めてTalentifyを使う方</p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Link href="/register?role=store" className="rounded-2xl border border-orange-300/30 bg-orange-400/10 px-4 py-4 text-center text-sm font-black text-orange-200 hover:bg-orange-400/15">
              店舗として登録
            </Link>
            <Link href="/register?role=talent" className="rounded-2xl border border-sky-300/30 bg-sky-400/10 px-4 py-4 text-center text-sm font-black text-sky-200 hover:bg-sky-400/15">
              演者として登録
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
