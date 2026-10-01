import { Suspense } from 'react'
import AuthCallbackClient from './AuthCallbackClient'

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-[#05050d] px-4 text-white">
          <p className="text-sm text-white/60">確認中...</p>
        </div>
      }
    >
      <AuthCallbackClient />
    </Suspense>
  )
}
