'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import MessagesPage from '@/components/messages/MessagesPage'
import { useUserRole } from '@/utils/useRole'

export default function MessagesTopPage() {
  const params = useSearchParams()
  const tabParam = params.get('tab') === 'offer' ? 'offer' : 'direct'
  const { role, loading } = useUserRole()
  if (loading || !role || (role !== 'store' && role !== 'talent')) return null
  return (
    <main className="p-4">
      <div className="border-b mb-4 flex space-x-4">
        <Link
          href="/messages?tab=direct"
          className={`px-2 pb-2 border-b-2 ${tabParam === 'direct' ? 'border-blue-500 font-medium' : 'border-transparent text-gray-500'}`}
        >
          直通
        </Link>
        <Link
          href="/messages?tab=offer"
          className={`px-2 pb-2 border-b-2 ${tabParam === 'offer' ? 'border-blue-500 font-medium' : 'border-transparent text-gray-500'}`}
        >
          オファー
        </Link>
      </div>
      <MessagesPage role={role} type={tabParam} />
    </main>
  )
}

