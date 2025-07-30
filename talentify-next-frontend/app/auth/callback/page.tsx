import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserRoleInfo, UserRole } from '@/lib/getUserRole'

export default async function AuthCallbackPage({
  searchParams,
}: {
  searchParams: { code?: string; role?: string }
}) {
  const supabase = await createClient()

  const code = searchParams.code
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) console.error('Failed to exchange code:', error)
  }

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    redirect('/login')
  }

  const userId = session!.user.id
  const pendingRole = (searchParams.role as UserRole | undefined) ?? 'store'

  const { role: existingRole } = await getUserRoleInfo(supabase, userId)
  let role: UserRole | null = existingRole

  if (!existingRole) {
    role = pendingRole
    if (role === 'talent') {
      const { error } = await supabase.from('talents').insert([
        { id: userId, user_id: userId, name: '', is_setup_complete: false },
      ])
      if (error) console.error('profile insert error:', error)
    } else if (role === 'company') {
      const { error } = await supabase.from('companies').insert([
        { user_id: userId, company_name: '', display_name: '' },
      ])
      if (error) console.error('profile insert error:', error)
    } else {
      const { error } = await supabase
        .from('stores')
        .upsert({ user_id: userId, store_name: '' }, { onConflict: 'user_id' })
      if (error) console.error('profile insert error:', error)
    }
  }

  const target = role ? `/${role}/edit` : '/'
  redirect(target)
}
