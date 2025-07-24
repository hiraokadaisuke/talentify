'use client'

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
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [confirmError, setConfirmError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleRegister = async () => {
    setGlobalError(null)
    setEmailError(null)
    setPasswordError(null)
    setConfirmError(null)

    let hasError = false

    if (!email) {
      setEmailError('メールアドレスを入力してください')
      hasError = true
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      setEmailError('メールアドレスの形式が正しくありません')
      hasError = true
    }

    if (!password) {
      setPasswordError('パスワードを入力してください')
      hasError = true
    }

    if (!confirm) {
      setConfirmError('パスワード（確認）を入力してください')
      hasError = true
    } else if (password !== confirm) {
      setConfirmError('パスワードが一致しません')
      hasError = true
    }

    if (!role) {
      setGlobalError('登録種別が不明です')
      return
    }

    if (hasError) return

// 🔽 ロールを保存（AuthCallback で使う）
  localStorage.setItem('pending_role', role)

    try {
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
        console.error('signUp error:', signUpError)
        const msg = signUpError.message
        if (msg.toLowerCase().includes('already')) {
          setGlobalError('このメールアドレスは既に登録されています')
        } else if (msg.toLowerCase().includes('invalid')) {
          setGlobalError('メールアドレスの形式が正しくありません')
        } else {
          setGlobalError('登録に失敗しました')
        }
        return
      }

      // ✅ メール送信成功 → check-email に遷移
      router.push('/check-email')
    } catch (e) {
      console.error('signUp failed:', e)
      setGlobalError('通信に失敗しました。インターネット接続をご確認ください')
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">新規登録</h1>

      {globalError && <p className="text-red-600">{globalError}</p>}

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
              aria-invalid={!!emailError}
              required
            />
            {emailError && (
              <p className="text-red-600 text-sm mt-1">{emailError}</p>
            )}
          </div>

          <div>
            <label className="block font-medium">パスワード</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={!!passwordError}
              required
            />
            {passwordError && (
              <p className="text-red-600 text-sm mt-1">{passwordError}</p>
            )}
          </div>

          <div>
            <label className="block font-medium">パスワード（確認）</label>
            <Input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              aria-invalid={!!confirmError}
              required
            />
            {confirmError && (
              <p className="text-red-600 text-sm mt-1">{confirmError}</p>
            )}
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
