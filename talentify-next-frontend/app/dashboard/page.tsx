import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardRedirect() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: store } = await supabase.from('stores').select('id').eq('user_id', user.id).maybeSingle()
  if (store) {
    redirect('/store/dashboard')
  }
  const { data: talent } = await supabase.from('talents').select('id').eq('user_id', user.id).maybeSingle()
  if (talent) {
    redirect('/talent/dashboard')
  }
  redirect('/')
}
