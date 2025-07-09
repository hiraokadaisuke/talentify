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
        // ログインできていない場合
        router.push('/login')
        return
      }

      const userId = session.user.id

      // profiles にレコードがあるか確認
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', userId)
        .single()

      if (!existingProfile) {
        // なければ作成（role: 'store'）
        await supabase.from('profiles').insert([
          {
            user_id: userId,
            role: 'store'
          }
        ])
      }

      // プロフィール編集ページへ
      router.push('/profile/edit')
    }

    checkAndRedirect()
  }, [router, supabase])

  return <p className="p-4">ログイン処理中です...</p>
}
