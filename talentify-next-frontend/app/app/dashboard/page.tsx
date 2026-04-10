import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserRoleInfo } from '@/lib/getUserRole'

export default async function AppDashboardPage() {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login?redirectedFrom=/app/dashboard')
  }

  const { role, isSetupComplete } = await getUserRoleInfo(supabase, session.user.id)

  if (role === 'store') {
    redirect(isSetupComplete ? '/store/dashboard' : '/store/edit')
  }

  if (role === 'talent') {
    redirect(isSetupComplete ? '/talent/dashboard' : '/talent/edit')
  }

  redirect('/dashboard')
}
