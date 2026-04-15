'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type AuthErrorCardProps = {
  initialErrorCode?: string
  initialError?: string
}

function parseHashParams(hashValue: string) {
  const hash = hashValue.startsWith('#') ? hashValue.slice(1) : hashValue
  return new URLSearchParams(hash)
}

export default function AuthErrorCard({ initialErrorCode, initialError }: AuthErrorCardProps) {
  const [hashErrorCode, setHashErrorCode] = useState<string | null>(null)
  const [hashError, setHashError] = useState<string | null>(null)
  const [emailFromQuery, setEmailFromQuery] = useState<string | null>(null)

  useEffect(() => {
    const params = parseHashParams(window.location.hash)
    setHashErrorCode(params.get('error_code'))
    setHashError(params.get('error'))

    const queryParams = new URLSearchParams(window.location.search)
    setEmailFromQuery(queryParams.get('email'))
  }, [])

  const effectiveErrorCode = hashErrorCode ?? initialErrorCode ?? undefined
  const effectiveError = hashError ?? initialError ?? undefined

  const detailMessage = useMemo(() => {
    if (effectiveErrorCode === 'otp_expired') {
      return '確認メールのリンクは有効期限切れです。新しい確認メールを再送して、最新のリンクからお試しください。'
    }

    if (effectiveError === 'access_denied') {
      return '認証が拒否されました。リンクが古いか、すでに使用済みの可能性があります。'
    }

    return '時間をおいて再度お試しいただくか、確認メールを再送して最新のリンクからアクセスしてください。'
  }, [effectiveError, effectiveErrorCode])

  const resendHref = emailFromQuery
    ? `/check-email?email=${encodeURIComponent(emailFromQuery)}&from=auth-error`
    : '/check-email?from=auth-error'

  return (
    <div className="mx-auto flex min-h-[calc(100vh-64px)] w-full max-w-3xl items-center justify-center px-4 py-12">
      <Card className="w-full max-w-xl">
        <CardHeader className="space-y-3">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" aria-hidden="true" />
            <p className="text-sm font-medium">認証エラー</p>
          </div>
          <CardTitle className="text-2xl">確認メールのリンクが無効か、有効期限が切れています</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm leading-relaxed text-muted-foreground">{detailMessage}</p>

          <div className="grid gap-3 sm:grid-cols-3">
            <Button asChild>
              <Link href="/login">ログインへ</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/register">新規登録へ</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={resendHref}>確認メール再送の案内へ</Link>
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            確認メールを再送してください。再送後は、最新のメールに記載されたリンクをご利用ください。
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
