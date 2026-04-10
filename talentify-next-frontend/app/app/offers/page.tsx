import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserRoleInfo } from '@/lib/getUserRole'

export default async function AppOffersPage() {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login?redirectedFrom=/app/offers')
  }

  const { role } = await getUserRoleInfo(supabase, session.user.id)

  if (role === 'store') {
    redirect('/store/offers')
  }

  if (role === 'talent') {
    redirect('/talent/offers')
  }

  redirect('/dashboard')
}
