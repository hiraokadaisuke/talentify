'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

function redirectToAuthError(
  router: ReturnType<typeof useRouter>,
  params?: { error?: string | null; errorCode?: string | null },
) {
  const query = new URLSearchParams()
  if (params?.error) query.set('error', params.error)
  if (params?.errorCode) query.set('error_code', params.errorCode)
  const suffix = query.toString() ? `?${query.toString()}` : ''
  router.replace(`/auth/error${suffix}`)
}

export default function AuthCallbackClient() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    let cancelled = false

    const complete = async () => {
      const supabase = createClient()
      const hash = new URLSearchParams(
        window.location.hash.startsWith('#')
          ? window.location.hash.slice(1)
          : window.location.hash,
      )

      const hashError = hash.get('error')
      const hashErrorCode = hash.get('error_code')
      if (hashError || hashErrorCode) {
        redirectToAuthError(router, {
          error: hashError,
          errorCode: hashErrorCode,
        })
        return
      }

      const accessToken = hash.get('access_token')
      const refreshToken = hash.get('refresh_token')
      const code = searchParams.get('code')

      try {
        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })
          if (error) throw error
        } else if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) throw error
        } else {
          const {
            data: { user },
            error,
          } = await supabase.auth.getUser()
          if (error || !user) {
            throw error ?? new Error('missing_auth_session')
          }
        }

        const response = await fetch('/api/auth/complete-confirmation', {
          method: 'POST',
          cache: 'no-store',
        })
        const payload = (await response.json().catch(() => null)) as
          | { ok?: boolean; target?: string }
          | null

        if (!response.ok || !payload?.ok || !payload.target) {
          throw new Error('confirmation_finalize_failed')
        }

        if (!cancelled) {
          router.replace(payload.target)
          router.refresh()
        }
      } catch (error) {
        console.error('email confirmation callback failed', error)
        if (!cancelled) {
          redirectToAuthError(router)
        }
      }
    }

    void complete()

    return () => {
      cancelled = true
    }
  }, [router, searchParams])

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-[#05050d] px-4 text-white">
      <div className="text-center">
        <Loader2 className="mx-auto h-7 w-7 animate-spin text-pink-300" />
        <p className="mt-4 font-semibold">メールアドレスを確認しています...</p>
        <p className="mt-2 text-sm text-white/55">
          確認が完了すると自動でダッシュボードへ移動します。
        </p>
      </div>
    </div>
  )
}
