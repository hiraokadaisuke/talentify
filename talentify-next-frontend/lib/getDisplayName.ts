import { createClient } from '@/lib/supabase/server'

export async function getDisplayName(role?: 'store' | 'talent') {
  try {
    const supabase = createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError) {
      console.error('getDisplayName getUser error', userError)
    }
    if (!user) return 'ゲスト'

    if (role === 'talent') {
      const { data: talent, error: talentError } = await supabase
        .from('talents')
        .select('stage_name')
        .eq('user_id', user.id)
        .maybeSingle<{ stage_name: string | null }>()
      if (talentError) {
        console.error('getDisplayName talent error', talentError)
      }
      if (talent?.stage_name) return talent.stage_name
    } else if (role === 'store') {
      const { data: store, error: storeError } = await supabase
        .from('stores')
        .select('store_name')
        .eq('user_id', user.id)
        .maybeSingle<{ store_name: string | null }>()
      if (storeError) {
        console.error('getDisplayName store error', storeError)
      }
      if (store?.store_name) return store.store_name
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles' as any)
      .select('display_name')
      .eq('id', user.id)
      .maybeSingle<{ display_name: string | null }>()
    if (profileError) {
      console.error('getDisplayName profile error', profileError)
    }
    return profile?.display_name ?? user.email ?? 'ユーザー'
  } catch (e) {
    console.error('getDisplayName failed', e)
    return 'ユーザー'
  }
}

export default getDisplayName
