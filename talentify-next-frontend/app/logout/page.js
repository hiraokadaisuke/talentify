'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LogoutPage() {
  const router = useRouter()

  useEffect(() => {
    async function logout() {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/logout`, {
          method: 'POST',
          credentials: 'include',
        })
      } finally {
        router.push('/login')
      }
    }
    logout()
  }, [router])

  return <p className="p-4">ログアウト中...</p>
}
