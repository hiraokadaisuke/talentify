'use client'

import { FormEvent, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const roleParam = searchParams.get('role')
  const initialRole =
    roleParam === 'talent' || roleParam === 'store' || roleParam === 'company'
      ? roleParam
      : null

  const role = initialRole
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [rateLimitError, setRateLimitError] = useState<string | null>(null)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [confirmError, setConfirmError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const getSignUpErrorMessage = (code?: string) => {
    switch (code) {
      case 'RATE_LIMITED':
        return '確認メールの送信回数が上限に達しました。しばらく時間をおいてから再度お試しください。'
      case 'EMAIL_ALREADY_EXISTS':
        return 'このメールアドレスは既に登録されています'
      case 'INVALID_EMAIL':
        return 'メールアドレスの形式が正しくありません'
      case 'INVALID_INPUT':
        return '入力内容を確認してください'
      default:
        return '登録に失敗しました。時間をおいて再度お試しください。'
    }
  }

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (isSubmitting) {
      return
    }

    setIsSubmitting(true)
    setGlobalError(null)
    setRateLimitError(null)
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

    try {
      if (!role) {
        setGlobalError('登録種別が不明です')
        return
      }

      if (hasError) {
        return
      }

      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          role,
        }),
      })

      const payload = await response.json().catch(() => null)

      if (!response.ok || !payload?.ok) {
        const message = getSignUpErrorMessage(payload?.error?.code)

        if (payload?.error?.code === 'RATE_LIMITED' || response.status === 429) {
          setRateLimitError(message)
        } else {
          setGlobalError(message)
        }

        return
      }

      // ✅ メール送信成功 → check-email に遷移
      const nextParams = new URLSearchParams({ email, role })
      router.push(`/check-email?${nextParams.toString()}`)
    } catch {
      setGlobalError('通信に失敗しました。インターネット接続をご確認ください')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">新規登録</h1>

      {globalError && <p className="text-red-600">{globalError}</p>}
      {rateLimitError && (
        <p className="text-amber-700" role="alert" aria-live="polite">
          {rateLimitError}
        </p>
      )}

      <form onSubmit={handleRegister} className="space-y-6">
        <div>
          <label className="block font-medium">メールアドレス</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={!!emailError}
            disabled={isSubmitting}
            required
          />
          {emailError && <p className="text-red-600 text-sm mt-1">{emailError}</p>}
        </div>

        <div>
          <label className="block font-medium">パスワード</label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={!!passwordError}
            disabled={isSubmitting}
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
            disabled={isSubmitting}
            required
          />
          {confirmError && <p className="text-red-600 text-sm mt-1">{confirmError}</p>}
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? '送信中...' : '登録'}
        </Button>
      </form>

      <p className="text-sm text-center">
        すでにアカウントをお持ちの方は{' '}
        <Link href="/login" className="text-blue-600 underline">
          ログイン
        </Link>
      </p>
    </div>
  )
}
