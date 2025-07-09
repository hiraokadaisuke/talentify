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

      // プロフィールを探す
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle()

      // 👇 プロフィールがない場合は初期登録（必要に応じて role は null に）
      if (!profile) {
        const { error: insertError } = await supabase.from('profiles').insert([
          {
            user_id: user.id,
            role: null, // または `user_metadata` から取得する場合は変更
            display_name: '',
            bio: '',
          }
        ])

        if (insertError) {
          console.error('プロフィール作成エラー:', insertError.message)
        }

        router.replace('/profile/setup') // プロフィール初期設定画面へ
        return
      }

      // 👇 既存プロフィールのroleで分岐
      if (profile.role === 'performer') {
        router.replace('/performer/dashboard')
      } else if (profile.role === 'store') {
        router.replace('/store/dashboard')
      } else {
        router.replace('/login') // 不正ロール
      }
    }

    redirectByRole()
  }, [router, supabase])

  return <p className="p-4 text-sm text-gray-600">ダッシュボードにリダイレクト中...</p>
}
