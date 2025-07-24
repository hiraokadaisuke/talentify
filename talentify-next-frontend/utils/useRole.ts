'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { getUserRoleInfo, UserRole } from '@/lib/getUserRole'

const supabase = createClient()

export function useUserRole() {
  const [role, setRole] = useState<UserRole | null>(null)
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
      const { role: r } = await getUserRoleInfo(supabase, user.id)
      setRole(r)
      setLoading(false)
    }

    fetchRole()
  }, [])

  return { role, loading }
}
