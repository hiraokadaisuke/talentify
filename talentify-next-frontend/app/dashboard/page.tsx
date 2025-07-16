'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/lib/supabase/types'

export default function DashboardRedirectPage() {
  const router = useRouter()
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    const redirectUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        return router.replace('/login')
      }

      const userId = session.user.id

      // テーブルとリダイレクト先の対応リスト
      const roleRedirectMap = [
        { table: 'stores', path: '/store/dashboard' },
        { table: 'talents', path: '/talent/dashboard' },
        { table: 'companies', path: '/company/dashboard' },
      ]

      // 所属テーブルがあれば即リダイレクト
      for (const { table, path } of roleRedirectMap) {
        const { data } = await supabase.from(table).select('id').eq('user_id', userId).maybeSingle()
        if (data) {
          return router.replace(path)
        }
      }

      // 所属がなければ pending_role から判断して insert → 編集ページへ
      const pendingRole = localStorage.getItem('pending_role') ?? 'store'
      const insertMap = {
        talent: { table: 'talents', editPath: '/talent/edit' },
        company: { table: 'companies', editPath: '/company/edit' },
        store: { table: 'stores', editPath: '/store/edit' },
      }

      const { table, editPath } = insertMap[pendingRole] ?? insertMap['store']
      const { error } = await supabase.from(table).insert([{ user_id: userId }])
      if (error) {
        console.error(`${pendingRole} insert error:`, error.message)
      }

      return router.replace(editPath)
    }

    redirectUser()
  }, [router, supabase])

  return <p className="p-4 text-sm text-gray-600">ダッシュボードにリダイレクト中...</p>
}
