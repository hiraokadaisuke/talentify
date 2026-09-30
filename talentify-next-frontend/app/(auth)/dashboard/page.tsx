'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUserRole } from '@/utils/useRole'

export default function DashboardRedirectPage() {
  const router = useRouter()
  const { role, isSetupComplete, loading } = useUserRole()

  useEffect(() => {
    if (loading) return

    if (!role) {
      router.replace('/account/role')
      return
    }
    if (role === 'store') {
      router.replace(isSetupComplete ? '/store/dashboard' : '/store/edit')
      return
    }
    if (role === 'talent') {
      router.replace(isSetupComplete ? '/talent/dashboard' : '/talent/edit')
      return
    }
    router.replace(isSetupComplete ? '/company/offers' : '/company/edit')
  }, [role, isSetupComplete, loading, router])

  return null
}
