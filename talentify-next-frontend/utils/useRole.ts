'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { getUserRoleInfo, UserRole } from '@/lib/getUserRole'

const supabase = createClient()

export function useUserRole() {
  const [role, setRole] = useState<UserRole | null>(null)
  const [isSetupComplete, setIsSetupComplete] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRole = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }
      const { role: r, isSetupComplete } = await getUserRoleInfo(supabase, user.id)
      setRole(r)
      setIsSetupComplete(isSetupComplete)
      setLoading(false)
    }

    fetchRole()
  }, [])

  return { role, isSetupComplete, loading }
}

export async function getServerUserRole() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { role: null, isSetupComplete: null }
  }
  const { role, isSetupComplete } = await getUserRoleInfo(supabase, user.id)
  return { role, isSetupComplete }
}
