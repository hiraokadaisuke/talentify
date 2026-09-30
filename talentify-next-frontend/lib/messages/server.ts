import { createServiceClient } from '@/lib/supabase/service'
import { getUserRoleInfo, type UserRole } from '@/lib/getUserRole'

export type MessagingIdentity = {
  userId: string
  role: UserRole
  name: string
}

export async function getMessagingIdentity(userId: string): Promise<MessagingIdentity | null> {
  const service = createServiceClient()
  const info = await getUserRoleInfo(service, userId)
  if (info.role !== 'store' && info.role !== 'talent') return null
  return {
    userId,
    role: info.role,
    name: info.name ?? (info.role === 'store' ? '店舗' : '演者'),
  }
}

export async function authorizeMessageTarget(params: {
  senderUserId: string
  receiverUserId: string
  offerId?: string | null
}) {
  const { senderUserId, receiverUserId, offerId } = params
  if (!receiverUserId || senderUserId === receiverUserId) {
    return { ok: false as const, reason: 'invalid_recipient' }
  }

  const [sender, receiver] = await Promise.all([
    getMessagingIdentity(senderUserId),
    getMessagingIdentity(receiverUserId),
  ])

  if (!sender || !receiver || sender.role === receiver.role) {
    return { ok: false as const, reason: 'forbidden_recipient' }
  }

  if (!offerId) {
    return { ok: true as const, sender, receiver }
  }

  const service = createServiceClient()
  const { data: offer, error: offerError } = await service
    .from('offers')
    .select('store_id,talent_id')
    .eq('id', offerId)
    .maybeSingle()

  if (offerError || !offer?.store_id || !offer?.talent_id) {
    return { ok: false as const, reason: 'offer_not_found' }
  }

  const [{ data: store }, { data: talent }] = await Promise.all([
    service.from('stores').select('user_id').eq('id', offer.store_id).maybeSingle(),
    service.from('talents').select('user_id').eq('id', offer.talent_id).maybeSingle(),
  ])

  const participantIds = new Set([store?.user_id, talent?.user_id].filter(Boolean))
  if (!participantIds.has(senderUserId) || !participantIds.has(receiverUserId)) {
    return { ok: false as const, reason: 'not_offer_participant' }
  }

  return { ok: true as const, sender, receiver }
}
