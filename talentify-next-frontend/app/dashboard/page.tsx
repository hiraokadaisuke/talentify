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

      const userId = session.user.id

      // 1. どのテーブルに存在するかチェック
      const { data: store } = await supabase.from('stores').select('id').eq('user_id', userId).maybeSingle()
      if (store) {
        router.replace('/store/dashboard')
        return
      }

      const { data: talent } = await supabase.from('talents').select('id').eq('user_id', userId).maybeSingle()
      if (talent) {
        router.replace('/talent/dashboard')
        return
      }

      const { data: company } = await supabase.from('companies').select('id').eq('user_id', userId).maybeSingle()
      if (company) {
        router.replace('/company/dashboard')
        return
      }

      // 2. どこにも存在しない場合 → pending_role を元に insert
      const pendingRole = localStorage.getItem('pending_role') ?? 'store'
      console.log('pendingRole:', pendingRole)

      if (pendingRole === 'talent') {
        const { error } = await supabase.from('talents').insert([{ user_id: userId, name: '' }])
        if (error) console.error('talent insert error:', error.message)
        router.replace('/talent/edit')
        return
      }

      if (pendingRole === 'company') {
        const { error } = await supabase.from('companies').insert([{ user_id: userId }])
        if (error) console.error('company insert error:', error.message)
        router.replace('/company/edit')
        return
      }

      // デフォルトは store
      const { error } = await supabase.from('stores').insert([{ user_id: userId }])
      if (error) console.error('store insert error:', error.message)
      router.replace('/store/edit')
    }

    redirectByRole()
  }, [router, supabase])

  return <p className="p-4 text-sm text-gray-600">ダッシュボードにリダイレクト中...</p>
}
