'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { getUserRoleInfo } from '@/lib/getUserRole'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    const { data: { session }, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (loginError || !session) {
      setError('メールアドレスまたはパスワードが間違っています')
      return
    }

    const userId = session.user.id
    const { role } = await getUserRoleInfo(supabase, userId)

    if (!role) {
      // TODO: explicit role selection page can be implemented here
    }

    router.replace(searchParams.get('redirectedFrom') ?? '/dashboard')
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
