import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import EditClient from './EditClient'
import { ensureTalentProfile } from '@/lib/provision'

export const dynamic = 'auto'

export default async function Page() {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  await ensureTalentProfile(supabase, session.user.id)

  return <EditClient />
}
