// utils/useRole.ts
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

const supabase = createClient()

export function useUserRole() {
  const [role, setRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRole = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single()

      if (data?.role) setRole(data.role)
      setLoading(false)
    }

    fetchRole()
  }, [])

  return { role, loading }
}
