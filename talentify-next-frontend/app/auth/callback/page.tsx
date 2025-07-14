'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function AuthCallbackPage() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAndRedirect = async () => {
      const {
        data: { session }
      } = await supabase.auth.getSession()

      if (!session) {
        router.push('/login')
        return
      }

      const userId = session.user.id
      const role = localStorage.getItem('pending_role') ?? 'store'

      // profiles にレコードがあるか確認
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', userId)
        .single()

      if (!existingProfile) {
        const { error: insertError } = await supabase.from('profiles').insert([
          {
            user_id: userId,
            role,
          }
        ])
        if (insertError) {
          console.error('profiles insert error:', insertError)
          return
        }
        localStorage.removeItem('pending_role')
      }

      // ✅ 共通プロフィールの初期設定ページへ
      router.push('/profile/setup')
    }

    checkAndRedirect()
  }, [router, supabase])

  return <p className="p-4">ログイン処理中です...</p>
}
