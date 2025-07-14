'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/lib/supabase/types'

export default function DashboardRedirectPage() {
  const router = useRouter()
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    const redirectByRole = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        router.replace('/login')
        return
      }

      const user = session.user

      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle()

      if (fetchError) {
        console.error('プロフィール取得エラー:', fetchError.message)
        router.replace('/login')
        return
      }

      if (!profile) {
        const { error: insertError } = await supabase.from('profiles').insert([
          {
            user_id: user.id,
            role: null,
            display_name: '',
            bio: '',
          }
        ])

        if (insertError) {
          console.error('プロフィール作成エラー:', insertError.message)
        }

        const pendingRole = localStorage.getItem('pending_role') ?? 'store'

        if (pendingRole === 'talent') {
          router.replace('/talent/edit')
        } else if (pendingRole === 'company') {
          router.replace('/company/edit')
        } else {
          router.replace('/store/edit')
        }

        return
      }

      switch (profile.role) {
        case 'talent':
          router.replace('/talent/dashboard')
          break
        case 'store':
          router.replace('/store/dashboard')
          break
        case 'company':
          router.replace('/company/dashboard')
          break
        default:
          router.replace('/login')
      }
    }

    redirectByRole()
  }, [router, supabase])

  return <p className="p-4 text-sm text-gray-600">ダッシュボードにリダイレクト中...</p>
}
