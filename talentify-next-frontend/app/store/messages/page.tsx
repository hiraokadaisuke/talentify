'use client'

import { useSearchParams } from 'next/navigation'
import MessagesPage from '@/components/messages/MessagesPage'

export default function StoreMessagesPage() {
  const params = useSearchParams()
  const tabParam = params.get('tab') === 'offer' ? 'offer' : 'direct'
  const partnerId = tabParam === 'direct' ? params.get('partner') : null

  return (
    <MessagesPage
      role="store"
      type={tabParam}
      basePath="/store/messages"
      initialPartnerId={partnerId}
    />
  )
}
