'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { API_BASE } from '@/lib/api'

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
