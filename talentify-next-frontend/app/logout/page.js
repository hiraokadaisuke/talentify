'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000'

export default function LogoutPage() {
  const router = useRouter()

  useEffect(() => {
    async function logout() {
      try {
        await fetch(`${API_BASE}/api/logout`, {
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
