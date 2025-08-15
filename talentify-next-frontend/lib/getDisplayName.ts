import { createClient } from '@/lib/supabase/server'

export async function getDisplayName(role: 'talent' | 'store') {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const user = session?.user
  if (!user) return null

  if (role === 'talent') {
    const { data: talent } = await supabase
      .from('talents')
      .select('stage_name')
      .eq('user_id', user.id)
      .maybeSingle<{ stage_name: string | null }>()
    if (talent?.stage_name) return talent.stage_name
  } else if (role === 'store') {
    const { data: store } = await supabase
      .from('stores')
      .select('store_name')
      .eq('user_id', user.id)
      .maybeSingle<{ store_name: string | null }>()
    if (store?.store_name) return store.store_name
  }

  const { data: profile } = await supabase
    .from('profiles' as any)
    .select('display_name')
    .eq('id', user.id)
    .maybeSingle<{ display_name: string | null }>()

  if (profile?.display_name) return profile.display_name
  return user.email
}

export default getDisplayName
