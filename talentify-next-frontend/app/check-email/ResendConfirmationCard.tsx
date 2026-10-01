'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { RESEND_CONFIRMATION_COOLDOWN_SECONDS } from '@/lib/auth/resend-confirmation'

function isValidEmail(value: string) {
  return /^\S+@\S+\.\S+$/.test(value)
}

export default function ResendConfirmationCard() {
  const searchParams = useSearchParams()
  const initialEmail = searchParams.get('email') ?? ''
  const role = searchParams.get('role')
  const [email, setEmail] = useState(initialEmail)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (cooldown <= 0) {
      return
    }

    const timer = window.setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => window.clearInterval(timer)
  }, [cooldown])

  const canSubmit = useMemo(() => {
    return !isSubmitting && cooldown === 0 && isValidEmail(email)
  }, [cooldown, email, isSubmitting])

  const onResend = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!canSubmit) {
      return
    }

    setIsSubmitting(true)
    setMessage(null)
    setError(null)

    try {
      const response = await fetch('/api/auth/resend-confirmation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          ...(role ? { role } : {}),
          // 将来的に captcha を追加する場合はここで token を付与する。
          // captchaToken,
        }),
      })

      const payload = (await response.json().catch(() => null)) as
        | { code?: string; message?: string }
        | null

      if (payload?.code === 'RATE_LIMITED' || response.status === 429) {
        setError('送信回数が上限に達しました。しばらく時間をおいてから再度お試しください。')
        setCooldown(RESEND_CONFIRMATION_COOLDOWN_SECONDS)
        return
      }

      if (payload?.code === 'NOT_FOUND_OR_ALREADY_VERIFIED') {
        setMessage(
          '該当する未確認アカウントが見つからないか、すでに確認済みです。最新のメールをご確認ください。'
        )
        setCooldown(RESEND_CONFIRMATION_COOLDOWN_SECONDS)
        return
      }

      if (!response.ok || payload?.code === 'RESEND_FAILED' || payload?.code === 'INVALID_INPUT') {
        setError('確認メールの再送に失敗しました。時間をおいて再度お試しください。')
        return
      }

      setMessage('確認メールを再送しました。受信トレイをご確認ください。')
      setCooldown(RESEND_CONFIRMATION_COOLDOWN_SECONDS)
    } catch {
      setError('通信に失敗しました。インターネット接続をご確認ください。')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mt-8 w-full max-w-md rounded-2xl border border-white/15 bg-white/[0.03] p-5 text-left">
      <h2 className="text-base font-semibold text-white">確認メールの再送</h2>
      <p className="mt-2 text-sm leading-6 text-white/55">
        リンクの有効期限が切れた場合は、こちらから確認メールを再送できます。
      </p>

      <form className="mt-4 space-y-3" onSubmit={onResend}>
        <label className="block text-sm font-medium text-white/70">メールアドレス</label>
        <Input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          disabled={isSubmitting}
          required
          className="border-white/20 bg-white/[0.06] text-white placeholder:text-white/30 focus-visible:ring-pink-300"
        />

        {error && (
          <p className="text-sm text-red-300" role="alert" aria-live="polite">
            {error}
          </p>
        )}

        {message && (
          <p className="text-sm text-emerald-300" role="status" aria-live="polite">
            {message}
          </p>
        )}

        {cooldown > 0 && (
          <p className="text-xs text-amber-300">再送は {cooldown} 秒後に可能です。</p>
        )}

        <Button type="submit" disabled={!canSubmit} className="w-full bg-white text-slate-950 hover:bg-white/90 disabled:bg-white/20 disabled:text-white/35">
          {isSubmitting ? '再送中...' : '確認メールを再送する'}
        </Button>
      </form>

      <p className="mt-3 text-xs leading-5 text-white/45">
        セキュリティ保護のため、アカウントの存在有無に関わらず同様の案内を表示する場合があります。
      </p>

      <Link href="/" className="mt-4 inline-block text-sm font-medium text-blue-300 underline underline-offset-4">
        トップページに戻る
      </Link>
    </div>
  )
}
