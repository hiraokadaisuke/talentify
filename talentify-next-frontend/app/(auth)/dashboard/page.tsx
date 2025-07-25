'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUserRole } from '@/utils/useRole'

export default function DashboardRedirectPage() {
  const router = useRouter()
  const { role, isSetupComplete, loading } = useUserRole()

  useEffect(() => {
    if (loading) return
    if (role === 'store') {
      router.replace(isSetupComplete ? '/store/dashboard' : '/store/edit')
    } else if (role === 'talent') {
      router.replace(isSetupComplete ? '/talent/dashboard' : '/talent/edit')
    } else if (role === 'company') {
      router.replace(isSetupComplete ? '/company/dashboard' : '/company/edit')
    } else {
      router.replace('/')
    }
  }, [role, isSetupComplete, loading, router])

  return null
}
