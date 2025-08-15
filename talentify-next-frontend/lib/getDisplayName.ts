import { createClient } from '@/lib/supabase/server'

export async function getDisplayName(role: 'talent' | 'store') {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const user = session?.user
  if (!user) return null

  if (role === 'talent') {
    const { data: talent } = await supabase
      .from('talents' as any)
      .select('stage_name')
      .eq('user_id', user.id)
      .maybeSingle()
    if (talent?.stage_name) return talent.stage_name as string
  } else if (role === 'store') {
    const { data: store } = await supabase
      .from('stores' as any)
      .select('store_name')
      .eq('user_id', user.id)
      .maybeSingle()
    if (store?.store_name) return store.store_name as string
  }

  const { data: profile } = await supabase
    .from('profiles' as any)
    .select('display_name')
    .eq('id', user.id)
    .maybeSingle()

  if (profile?.display_name) return profile.display_name as string
  return user.email
}

export default getDisplayName
