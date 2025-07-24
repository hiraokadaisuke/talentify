'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { getUserRoleInfo } from '@/lib/getUserRole'

export default function AuthCallbackPage() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAndRedirect = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.push('/login')
        return
      }

      const userId = session.user.id
      const role = localStorage.getItem('pending_role') ?? 'store'

      const { role: existingRole } = await getUserRoleInfo(supabase, userId)

      if (!existingRole) {
        const table = role === 'talent' ? 'talents' : role === 'company' ? 'companies' : 'stores'
        const { error: insertError } = await supabase.from(table).insert([{ user_id: userId }])
        if (insertError) {
          console.error('profile insert error:', insertError)
          return
        }
      }

      // ✅ ロールに応じて edit ページへリダイレクト
      if (role === 'store') {
        router.push('/store/edit')
      } else if (role === 'talent') {
        router.push('/talent/edit')
      } else {
        router.push('/') // 万が一不明なロールだった場合
      }

      localStorage.removeItem('pending_role')
    }

    checkAndRedirect()
  }, [router, supabase])

  return <p className="p-4">ログイン処理中です...</p>
}
