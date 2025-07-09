'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { getRedirectUrl } from '@/lib/getRedirectUrl'

const supabase = createClient()

export default function RegisterForm() {
  const searchParams = useSearchParams()
  const roleParam = searchParams.get('role')
  const initialRole = roleParam === 'performer' || roleParam === 'store' ? roleParam : null

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

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: getRedirectUrl(role),
      },
    })

    // ✅ ログ出力で user と session の中身を確認
    console.log('✅ signUp後のdata:', data)
    console.log('➡️ data.user:', data.user)
    console.log('➡️ data.session:', data.session)

    if (signUpError) {
      setError(signUpError.message)
      return
    }

    const user = data.user
    if (user) {
      const { error: profileError } = await supabase.from('profiles').insert([
        {
          id: user.id,
          display_name: '',
          bio: '',
        },
      ])

      if (profileError) {
        setError(`プロフィール登録エラー: ${profileError.message}`)
        return
      }

      setSuccess(true)
    } else {
      console.warn('⚠️ userがnullのためprofilesにinsertできません')
    }
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
