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
      if (!user) { setLoading(false); return }

      const { data: store } = await supabase.from('stores').select('id').eq('user_id', user.id).maybeSingle()
      const { data: talent } = await supabase.from('talents').select('id').eq('user_id', user.id).maybeSingle()
      const { data: company } = await supabase.from('companies').select('id').eq('user_id', user.id).maybeSingle()

      if (store) setRole('store')
      else if (talent) setRole('talent')
      else if (company) setRole('company')
      setLoading(false)
    }

    fetchRole()
  }, [])

  return { role, loading }
}
