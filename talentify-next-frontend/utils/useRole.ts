'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { getUserRoleInfo, UserRole } from '@/lib/getUserRole'

const supabase = createClient()

export function useUserRole() {
  const [role, setRole] = useState<UserRole | null>(null)
  const [isSetupComplete, setIsSetupComplete] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRole = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      const user = session?.user
      if (!user) {
        setLoading(false)
        setRole(null)
        setIsSetupComplete(null)
        return
      }
      const { role: r, isSetupComplete } = await getUserRoleInfo(supabase, user.id)
      setRole(r)
      setIsSetupComplete(isSetupComplete)
      setLoading(false)
    }

    fetchRole()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        getUserRoleInfo(supabase, session.user.id).then(({ role: r, isSetupComplete }) => {
          setRole(r)
          setIsSetupComplete(isSetupComplete)
          setLoading(false)
        })
      } else {
        setRole(null)
        setIsSetupComplete(null)
        setLoading(false)
      }
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  return { role, isSetupComplete, loading }
}

