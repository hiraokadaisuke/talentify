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
      // When the user clicks the confirmation link from the email, Supabase
      // appends an auth `code` to the callback URL. We need to exchange this
      // code for a session so that `getSession` returns a valid session.
      const urlParams = new URLSearchParams(window.location.search)
      const code = urlParams.get('code')

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) {
          console.error('Failed to exchange code:', error)
        }
      }

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
        if (role === 'talent') {
          const { error: insertError } = await supabase
            .from('talents')
            .insert([
              {
                id: userId,
                email: session.user.email ?? '',
                name: '',
              },
            ])
          if (insertError) {
            console.error('profile insert error:', insertError)
            return
          }
        } else if (role === 'company') {
          const { error: insertError } = await supabase
            .from('companies')
            .insert([
              {
                user_id: userId,
                company_name: '',
                display_name: '',
              },
            ])
          if (insertError) {
            console.error('profile insert error:', insertError)
            return
          }
        } else {
          const { error: upsertError } = await supabase
            .from('stores')
            .upsert(
              { user_id: userId, store_name: '' },
              { onConflict: 'user_id' }
            )
          if (upsertError) {
            console.error('profile insert error:', upsertError)
            alert(`Supabase更新エラー: ${upsertError.message}`)
            if (
              upsertError.message.toLowerCase().includes('row level security') ||
              upsertError.message.toLowerCase().includes('permission')
            ) {
              console.warn('RLS policy may prevent inserting/updating stores')
            }
            return
          }
        }
      }

      // ✅ ロールに応じて edit ページへリダイレクト
      if (role === 'store') {
        router.push('/store/edit')
      } else if (role === 'talent') {
        router.push('/talent/edit')
      } else if (role === 'company') {
        router.push('/company/edit')
      } else {
        router.push('/') // 万が一不明なロールだった場合
      }

      localStorage.removeItem('pending_role')
    }

    checkAndRedirect()
  }, [router, supabase])

  return <p className="p-4">ログイン処理中です...</p>
}
