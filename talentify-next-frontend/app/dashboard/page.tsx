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

      const { data: store } = await supabase.from('stores').select('id').eq('user_id', user.id).maybeSingle()
      const { data: talent } = await supabase.from('talents').select('id').eq('user_id', user.id).maybeSingle()
      const { data: company } = await supabase.from('companies').select('id').eq('user_id', user.id).maybeSingle()

      const profileRole = store ? 'store' : talent ? 'talent' : company ? 'company' : null

      if (error) {
        console.error('プロフィール取得エラー:', error.message)
        router.replace('/login')
        return
      }

      // ✅ プロフィールが存在しない場合 → ロールごとの編集画面へ
      if (!profileRole) {
        const pendingRole = localStorage.getItem('pending_role') ?? 'store'
        const table = pendingRole === 'talent' ? 'talents' : pendingRole === 'company' ? 'companies' : 'stores'
        const { error: insertError } = await supabase.from(table).insert([{ user_id: user.id }])
        if (insertError) {
          console.error('プロフィール作成エラー:', insertError.message)
        }
        if (pendingRole === 'talent') {
          router.replace('/talent/edit')
        } else {
          router.replace('/store/edit')
        }
        return
      }

      // ✅ 既に role が登録されている場合 → 各ダッシュボードへ
      switch (profileRole) {
        case 'talent':
          router.replace('/talent/dashboard')
          break
        case 'store':
          router.replace('/store/dashboard')
          break
        default:
          router.replace('/login')
      }
    }

    redirectByRole()
  }, [router, supabase])

  return <p className="p-4 text-sm text-gray-600">ダッシュボードにリダイレクト中...</p>
}
