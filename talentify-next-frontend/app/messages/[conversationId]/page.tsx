import { redirect } from 'next/navigation'

type Props = {
  params: Promise<{ conversationId: string }>
}

export default async function LegacyConversationPage({ params }: Props) {
  const { conversationId } = await params
  redirect(`/messages?tab=direct&partner=${encodeURIComponent(conversationId)}`)
}
