import { redirect } from 'next/navigation'
import { resolveMessageTargetUserId } from '@/lib/resolve-message-target'

type Props = {
  params: Promise<{ id: string }>
}

export default async function StoreMessageTargetPage({ params }: Props) {
  const { id } = await params
  const targetUserId = await resolveMessageTargetUserId(id)

  if (!targetUserId) {
    redirect('/store/messages?tab=direct')
  }

  redirect(`/messages/${targetUserId}`)
}
