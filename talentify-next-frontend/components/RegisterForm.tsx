'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { getRedirectUrl } from '@/lib/getRedirectUrl'

const supabase = createClient()

export default function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const roleParam = searchParams.get('role')
  const initialRole = roleParam === 'talent' || roleParam === 'store' ? roleParam : null

  const [role] = useState(initialRole)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleRegister = async () => {
    setError(null)

    if (!email || !password || !confirm) {
      setError('すべての項目を入力してください')
      return
    }

    if (password !== confirm) {
      setError('パスワードが一致しません')
      return
    }

    if (!role) {
      setError('登録種別が不明です')
      return
    }

// 🔽 ロールを保存（AuthCallback で使う）
  localStorage.setItem('pending_role', role)

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: getRedirectUrl(role),
      },
    })

    console.log('✅ signUp後のdata:', data)
    console.log('➡️ data.user:', data.user)
    console.log('➡️ data.session:', data.session)

    if (signUpError) {
      setError(signUpError.message)
      return
    }

    // ✅ メール送信成功 → check-email に遷移
    router.push('/check-email')
  }

  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">新規登録</h1>

      {error && <p className="text-red-600">{error}</p>}

      {success ? (
        <p className="text-green-600">
          確認メールを送信しました。メールを確認してください。
        </p>
      ) : (
        <>
          <div>
            <label className="block font-medium">メールアドレス</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block font-medium">パスワード</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block font-medium">パスワード（確認）</label>
            <Input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </div>

          <Button onClick={handleRegister}>登録</Button>
        </>
      )}

      <p className="text-sm text-center">
        すでにアカウントをお持ちの方は{' '}
        <Link href="/login" className="text-blue-600 underline">
          ログイン
        </Link>
      </p>
    </div>
  )
}
