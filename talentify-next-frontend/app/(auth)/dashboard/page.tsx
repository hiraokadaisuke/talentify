'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUserRole } from '@/utils/useRole'

export default function DashboardRedirectPage() {
  const router = useRouter()
  const { role, loading } = useUserRole()

  useEffect(() => {
    if (loading) return
    if (role === 'store') router.replace('/store/dashboard')
    else if (role === 'talent') router.replace('/talent/dashboard')
    else router.replace('/')
  }, [role, loading, router])

  return null
}
