'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [router, searchParams, supabase])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    console.log('🟦 ログイン開始')
    console.log('API_BASE:', API_BASE)

    try {
      const csrfRes = await fetch(`${API_BASE ?? ''}/api/csrf-token`, {
        credentials: 'include',
      })
      console.log('🟨 /api/csrf-token レスポンスステータス:', csrfRes.status)

      if (!csrfRes.ok) {
        throw new Error('csrf')
      }

      const { csrfToken } = await csrfRes.json()
      console.log('🟩 CSRFトークン取得成功:', csrfToken)

      const res = await fetch(`${API_BASE ?? ''}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })

      console.log('🟨 /api/login レスポンスステータス:', res.status)

      if (!res.ok) {
        const errorText = await res.text()
        console.error('❌ ログインAPI失敗:', errorText)
        setError('メールアドレスまたはパスワードが間違っています')
        return
      }

      console.log('✅ ログイン成功 → ダッシュボードへ遷移')
      router.replace(searchParams.get('redirectedFrom') ?? '/dashboard')
    } catch (err) {
      console.error('🔥 ログイン処理エラー:', err)
      const message =
        err instanceof Error && err.message === 'csrf'
          ? 'CSRFトークンの取得に失敗しました。CORS またはセッションエラーの可能性があります'
          : 'ログインに失敗しました'
      setError(message)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-4">ログイン</h1>
      <form onSubmit={handleSubmit}>
        <label className="block mb-2">
          メールアドレス:
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mt-1 p-2 border rounded"
            required
          />
        </label>
        <label className="block mb-4">
          パスワード:
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mt-1 p-2 border rounded"
            required
          />
        </label>
        <label className="inline-flex items-center mb-4">
          <input
            type="checkbox"
            checked={showPassword}
            onChange={() => setShowPassword(!showPassword)}
            className="mr-2"
          />
          パスワードを表示
        </label>
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded">
          ログイン
        </button>
      </form>
    </div>
  )
}
