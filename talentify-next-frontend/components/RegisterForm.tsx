'use client'

import { FormEvent, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { PRIVACY_VERSION, TERMS_VERSION } from '@/lib/legal/version'

export default function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const roleParam = searchParams.get('role')
  const initialRole =
    roleParam === 'talent' || roleParam === 'store'
      ? roleParam
      : null

  const role = initialRole
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [rateLimitError, setRateLimitError] = useState<string | null>(null)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [phoneError, setPhoneError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [confirmError, setConfirmError] = useState<string | null>(null)
  const [agreementError, setAgreementError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const getSignUpErrorMessage = (code?: string) => {
    switch (code) {
      case 'RATE_LIMITED':
        return '確認メールの送信回数が上限に達しました。しばらく時間をおいてから再度お試しください。'
      case 'EMAIL_ALREADY_EXISTS':
        return 'このメールアドレスは既に登録されています。ログインしてください。'
      case 'INVALID_EMAIL':
        return 'メールアドレスの形式が正しくありません'
      case 'INVALID_INPUT':
        return '入力内容を確認してください'
      default:
        return '登録に失敗しました。時間をおいて再度お試しください。'
    }
  }

  if (!role) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-[#05050d] px-5 pb-16 pt-28 text-white">
        <div className="mx-auto w-full max-w-2xl">
          <div className="text-center">
            <Link href="/" className="inline-flex">
              <span className="inline-flex flex-col items-center leading-none">
                <span className="text-2xl font-black tracking-tight text-white">来店ナビ</span>
                <span className="mt-2 text-[9px] font-bold tracking-[0.3em] text-[#FFC400]">RAITEN NAVI</span>
              </span>
            </Link>
            <h1 className="mt-7 text-3xl font-black sm:text-4xl">新規登録</h1>
            <p className="mt-3 text-sm font-medium leading-7 text-white/65">
              利用する立場を選んでください。登録後の画面と機能が自動で切り替わります。
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <Link
              href="/register?role=store"
              className="rounded-3xl border border-orange-300/30 bg-gradient-to-br from-orange-500/20 to-pink-500/10 p-6 transition hover:-translate-y-1 hover:border-orange-300/60"
            >
              <p className="text-xs font-black tracking-[0.18em] text-orange-300">FOR STORES</p>
              <h2 className="mt-3 text-2xl font-black">店舗として登録</h2>
              <p className="mt-3 text-sm font-medium leading-7 text-white/65">
                演者検索・オファー・案件管理を利用する店舗向けアカウントです。
              </p>
            </Link>
            <Link
              href="/register?role=talent"
              className="rounded-3xl border border-sky-300/30 bg-gradient-to-br from-sky-500/20 to-blue-500/10 p-6 transition hover:-translate-y-1 hover:border-sky-300/60"
            >
              <p className="text-xs font-black tracking-[0.18em] text-sky-300">FOR TALENTS</p>
              <h2 className="mt-3 text-2xl font-black">演者として登録</h2>
              <p className="mt-3 text-sm font-medium leading-7 text-white/65">
                プロフィール・予定・オファー・請求管理を利用する演者向けアカウントです。
              </p>
            </Link>
          </div>

          <p className="mt-7 text-center text-sm text-white/65">
            すでにアカウントをお持ちの方は{' '}
            <Link href="/login" className="font-black text-white underline underline-offset-4">ログイン</Link>
          </p>
        </div>
      </div>
    )
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
    setPhoneError(null)
    setPasswordError(null)
    setConfirmError(null)
    setAgreementError(null)

    let hasError = false

    if (!email) {
      setEmailError('メールアドレスを入力してください')
      hasError = true
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      setEmailError('メールアドレスの形式が正しくありません')
      hasError = true
    }

    const normalizedPhone = phone.replace(/\D/g, '')
    if (!phone) {
      setPhoneError('電話番号を入力してください')
      hasError = true
    } else if (!/^\d{10,11}$/.test(normalizedPhone)) {
      setPhoneError('電話番号は10〜11桁の数字で入力してください')
      hasError = true
    }

    if (!password) {
      setPasswordError('パスワードを入力してください')
      hasError = true
    } else if (password.length < 8) {
      setPasswordError('パスワードは8文字以上で入力してください')
      hasError = true
    }

    if (!confirm) {
      setConfirmError('パスワード（確認）を入力してください')
      hasError = true
    } else if (password !== confirm) {
      setConfirmError('パスワードが一致しません')
      hasError = true
    }

    if (!agreed) {
      setAgreementError('利用規約とプライバシーポリシーへの同意が必要です')
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
          phone: normalizedPhone,
          password,
          role,
          acceptTerms: agreed,
          acceptPrivacy: agreed,
          termsVersion: TERMS_VERSION,
          privacyVersion: PRIVACY_VERSION,
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
    <div className="min-h-[calc(100vh-4rem)] bg-[#05050d] px-5 pb-16 pt-28 text-white">
      <div className="mx-auto max-w-md rounded-3xl border border-white/10 bg-white/[0.06] p-6 shadow-2xl sm:p-8">
      <p className="text-xs font-black tracking-[0.18em] text-pink-300">
        {role === 'store' ? 'FOR STORES' : role === 'talent' ? 'FOR TALENTS' : 'ACCOUNT'}
      </p>
      <h1 className="mt-2 text-2xl font-black">
        {role === 'store' ? '店舗アカウント登録' : role === 'talent' ? '演者アカウント登録' : '新規登録'}
      </h1>

      {globalError && <p className="text-red-600">{globalError}</p>}
      {rateLimitError && (
        <p
          className="rounded-xl border border-amber-300/20 bg-amber-400/10 px-4 py-3 text-sm font-semibold leading-6 text-amber-200"
          role="alert"
          aria-live="polite"
        >
          {rateLimitError}
        </p>
      )}

      <form onSubmit={handleRegister} className="space-y-6">
        <div>
          <label className="block font-medium text-white/80">メールアドレス</label>
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
          <label className="block font-medium text-white/80">電話番号</label>
          <Input
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            aria-invalid={!!phoneError}
            disabled={isSubmitting}
            placeholder="例：09012345678"
            required
          />
          <p className="mt-1 text-xs text-white/45">案件連絡用です。演者の電話番号は、通話を許可した案件でのみホールに表示します。</p>
          {phoneError && <p className="mt-1 text-sm text-red-600">{phoneError}</p>}
        </div>

        <div>
          <label className="block font-medium text-white/80">パスワード</label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={!!passwordError}
            disabled={isSubmitting}
            minLength={8}
            autoComplete="new-password"
            required
          />
          <p className="mt-1 text-xs text-white/45">8文字以上で設定してください。</p>
          {passwordError && (
            <p className="text-red-600 text-sm mt-1">{passwordError}</p>
          )}
        </div>

        <div>
          <label className="block font-medium text-white/80">パスワード（確認）</label>
          <Input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            aria-invalid={!!confirmError}
            disabled={isSubmitting}
            minLength={8}
            autoComplete="new-password"
            required
          />
          {confirmError && <p className="text-red-600 text-sm mt-1">{confirmError}</p>}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <label className="flex items-start gap-3 text-sm leading-6 text-white/75">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(event) => setAgreed(event.target.checked)}
              disabled={isSubmitting}
              className="mt-1 size-4 shrink-0"
              required
            />
            <span>
              <Link
                href="/terms"
                target="_blank"
                className="font-semibold text-white underline underline-offset-4"
              >
                利用規約
              </Link>
              {' '}および{' '}
              <Link
                href="/privacy"
                target="_blank"
                className="font-semibold text-white underline underline-offset-4"
              >
                プライバシーポリシー
              </Link>
              を確認し、同意します。
            </span>
          </label>
          {agreementError && (
            <p className="mt-2 text-sm text-red-400" role="alert">
              {agreementError}
            </p>
          )}
        </div>

        <div className="pt-1">
          <Button
            type="submit"
            disabled={isSubmitting || !agreed}
            className="h-14 w-full rounded-2xl border border-white/15 bg-gradient-to-r from-orange-400 via-pink-500 to-fuchsia-500 text-base font-black text-white shadow-[0_12px_32px_rgba(236,72,153,0.28)] transition hover:brightness-105 disabled:border-white/10 disabled:bg-none disabled:bg-white/10 disabled:text-white/35 disabled:shadow-none"
          >
            {isSubmitting ? '確認メールを送信中...' : '同意して登録する'}
          </Button>
          <p className="mt-2 text-center text-xs text-white/45">
            登録後、メールアドレス確認用のメールを送信します。
          </p>
        </div>
      </form>

      <p className="text-sm text-center text-white/65">
        すでにアカウントをお持ちの方は{' '}
        <Link href="/login" className="font-black text-white underline underline-offset-4">
          ログイン
        </Link>
      </p>
      <p className="text-center text-xs text-white/45">
        <Link href="/register" className="hover:text-white">登録種別を選び直す</Link>
      </p>
      </div>
    </div>
  )
}
