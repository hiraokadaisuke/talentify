'use client'
import { useState } from 'react'

export default function LogoutButton() {
  const [error, setError] = useState(null)

  const handleLogout = async () => {
    setError(null)
    try {
      const tokenRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/csrf-token`, {
        credentials: 'include'
      })
      if (!tokenRes.ok) throw new Error('token')
      const { csrfToken } = await tokenRes.json()
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/logout`, {
        method: 'POST',
        headers: {
          'X-CSRF-Token': csrfToken
        },
        credentials: 'include'
      })
      if (!res.ok) throw new Error('logout failed')
      console.log('logout success')
    } catch (e) {
      setError('ログアウトに失敗しました')
    }
  }

  return (
    <div className="inline-block">
      <button onClick={handleLogout} className="font-semibold hover:underline">
        ログアウト
      </button>
      {error && <span className="ml-2 text-red-600 text-sm">{error}</span>}
    </div>
  )
}
