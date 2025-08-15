import { createClient } from '@/lib/supabase/server'

export type ActorContext = {
  userId: string
  role: 'store' | 'talent' | 'unknown'
  storeId?: string
  talentId?: string
  displayName: string
}

export async function resolveActorContext(): Promise<ActorContext> {
  const supabase = createClient()
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { userId: '', role: 'unknown', displayName: 'ゲスト' }
    }

    const userId = user.id

    try {
      const { data: store } = await supabase
        .from('stores')
        .select('id, store_name')
        .eq('user_id', userId)
        .maybeSingle()
      if (store) {
        return {
          userId,
          role: 'store',
          storeId: (store as any).id ?? '',
          displayName: (store as any).store_name ?? ''
        }
      }
    } catch {}

    try {
      const { data: talent } = await supabase
        .from('talents')
        .select('id, stage_name')
        .eq('user_id', userId)
        .maybeSingle()
      if (talent) {
        return {
          userId,
          role: 'talent',
          talentId: (talent as any).id ?? '',
          displayName: (talent as any).stage_name ?? ''
        }
      }
    } catch {}

    let displayName = ''
    try {
      const { data: profile } = await supabase
        .from('profiles' as any)
        .select('display_name')
        .eq('id', userId)
        .maybeSingle()
      displayName =
        (profile as any)?.display_name || user.email || 'ユーザー'
    } catch {
      displayName = user.email || 'ユーザー'
    }

    return { userId, role: 'unknown', displayName }
  } catch {
    return { userId: '', role: 'unknown', displayName: 'ゲスト' }
  }
}
