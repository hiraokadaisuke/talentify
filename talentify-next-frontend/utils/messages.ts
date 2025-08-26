'use client'

import { createClient } from '@/utils/supabase/client'

const supabase = createClient()

export async function getUnreadMessageCount(role: 'store' | 'talent'): Promise<number> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return 0

  const { data, error } = await supabase.rpc('unread_messages_count', { role } as any)
  if (error) {
    console.error('failed to fetch unread messages count', error)
    return 0
  }
  return (data as number) ?? 0
}
