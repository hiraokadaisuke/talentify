import MessagesPage, { type MessageRow } from '@/components/messages/MessagesPage'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUserWithClient } from '@/lib/auth/getCurrentUserWithClient'
import { getMessageInboxForUser, type MessageInboxType } from '@/lib/messages/getMessageInbox'

type PageProps = {
  searchParams?: {
    tab?: string | string[]
    partner?: string | string[]
  }
}

function first(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value
}

async function loadInitialMessages(type: MessageInboxType): Promise<{
  messages: MessageRow[]
  userId: string | null
  loadError: boolean
}> {
  const supabase = createClient()

  try {
    const { user, error: userError } = await getCurrentUserWithClient(supabase)
    if (userError || !user) {
      return { messages: [], userId: null, loadError: true }
    }

    const data = await getMessageInboxForUser(supabase, user.id, type)
    return {
      messages: data as unknown as MessageRow[],
      userId: user.id,
      loadError: false,
    }
  } catch (error) {
    console.error('failed to preload store messages', error)
    return { messages: [], userId: null, loadError: true }
  }
}

export default async function StoreMessagesPage({ searchParams }: PageProps) {
  const tab = first(searchParams?.tab) === 'offer' ? 'offer' : 'direct'
  const partnerId = tab === 'direct' ? first(searchParams?.partner) ?? null : null
  const { messages, userId, loadError } = await loadInitialMessages(tab)

  return (
    <MessagesPage
      role="store"
      type={tab}
      basePath="/store/messages"
      initialPartnerId={partnerId}
      initialMessages={messages}
      initialUserId={userId}
      initialLoadError={loadError}
    />
  )
}
