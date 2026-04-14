import { getPrismaClient } from '@/lib/prisma'
import type { RecipientRole } from './payload'

type ResolveRecipientRoleParams = {
  entityType: string | null | undefined
  entityId: string | null | undefined
  actorId?: string | null
}

type ResolveActorNameParams = {
  actorId?: string | null
  fallbackName?: string | null
}

type UserIdRow = { user_id: string | null }
type MessageParticipantRow = { participant_user_ids: string[] | null }
type InvoiceUserRow = { store_user_id: string | null; talent_user_id: string | null }
type ReviewUserRow = { store_user_id: string | null; talent_user_id: string | null }
type OfferUserRow = { store_user_id: string | null; talent_user_id: string | null }

async function resolveRoleByUserId(userId: string | null | undefined): Promise<RecipientRole> {
  if (!userId) return 'unknown'

  const prisma = getPrismaClient()

  const [talent, store, company] = await Promise.all([
    prisma.talents.findFirst({ where: { user_id: userId }, select: { id: true } }),
    prisma.stores.findFirst({ where: { user_id: userId }, select: { id: true } }),
    prisma.companies.findFirst({ where: { user_id: userId }, select: { id: true } }),
  ])

  if (talent) return 'talent'
  if (store) return 'store'
  if (company) return 'company'
  return 'unknown'
}

export async function resolveRecipientRole({
  entityType,
  entityId,
  actorId,
}: ResolveRecipientRoleParams): Promise<RecipientRole> {
  if (!entityId || !entityType) return 'unknown'

  const prisma = getPrismaClient()

  if (entityType === 'message') {
    const messageRows = await prisma.$queryRaw<UserIdRow[]>`
      SELECT recipient_user_id AS user_id
      FROM public.messages
      WHERE id = ${entityId}::uuid
      LIMIT 1
    `

    const directRecipientRole = await resolveRoleByUserId(messageRows[0]?.user_id ?? null)
    if (directRecipientRole !== 'unknown') return directRecipientRole

    const participantsRows = await prisma.$queryRaw<MessageParticipantRow[]>`
      SELECT mt.participant_user_ids
      FROM public.messages m
      JOIN public.message_threads mt ON mt.id = m.thread_id
      WHERE m.id = ${entityId}::uuid
      LIMIT 1
    `

    const participants = participantsRows[0]?.participant_user_ids ?? []
    const recipientUserId = participants.find((userId) => userId && userId !== actorId)
    return resolveRoleByUserId(recipientUserId ?? null)
  }

  if (entityType === 'invoice' || entityType === 'payment') {
    const rows = await prisma.$queryRaw<InvoiceUserRow[]>`
      SELECT
        s.user_id AS store_user_id,
        t.user_id AS talent_user_id
      FROM public.invoices i
      LEFT JOIN public.stores s ON s.id = i.store_id
      LEFT JOIN public.talents t ON t.id = i.talent_id
      WHERE i.id = ${entityId}::uuid
      LIMIT 1
    `

    const invoice = rows[0]
    if (!invoice) return 'unknown'

    if (actorId && actorId === invoice.store_user_id) return resolveRoleByUserId(invoice.talent_user_id)
    if (actorId && actorId === invoice.talent_user_id) return resolveRoleByUserId(invoice.store_user_id)

    const storeRole = await resolveRoleByUserId(invoice.store_user_id)
    if (storeRole !== 'unknown') return storeRole
    return resolveRoleByUserId(invoice.talent_user_id)
  }

  if (entityType === 'review') {
    const rows = await prisma.$queryRaw<ReviewUserRow[]>`
      SELECT
        s.user_id AS store_user_id,
        t.user_id AS talent_user_id
      FROM public.reviews r
      LEFT JOIN public.stores s ON s.id = r.store_id
      LEFT JOIN public.talents t ON t.id = r.talent_id
      WHERE r.id = ${entityId}::uuid
      LIMIT 1
    `

    const review = rows[0]
    if (!review) return 'unknown'

    if (actorId && actorId === review.store_user_id) return resolveRoleByUserId(review.talent_user_id)
    if (actorId && actorId === review.talent_user_id) return resolveRoleByUserId(review.store_user_id)

    return resolveRoleByUserId(review.talent_user_id ?? review.store_user_id)
  }

  if (entityType === 'offer') {
    const rows = await prisma.$queryRaw<OfferUserRow[]>`
      SELECT
        s.user_id AS store_user_id,
        t.user_id AS talent_user_id
      FROM public.offers o
      LEFT JOIN public.stores s ON s.id = o.store_id
      LEFT JOIN public.talents t ON t.id = o.talent_id
      WHERE o.id = ${entityId}::uuid
      LIMIT 1
    `

    const offer = rows[0]
    if (!offer) return 'unknown'

    if (actorId && actorId === offer.store_user_id) return resolveRoleByUserId(offer.talent_user_id)
    if (actorId && actorId === offer.talent_user_id) return resolveRoleByUserId(offer.store_user_id)

    const storeRole = await resolveRoleByUserId(offer.store_user_id)
    if (storeRole !== 'unknown') return storeRole
    return resolveRoleByUserId(offer.talent_user_id)
  }

  return 'unknown'
}

export async function resolveActorName({ actorId, fallbackName }: ResolveActorNameParams): Promise<string | null> {
  if (!actorId) return fallbackName ?? null

  const prisma = getPrismaClient()
  const [talent, store, company] = await Promise.all([
    prisma.talents.findFirst({ where: { user_id: actorId }, select: { stage_name: true, name: true, display_name: true } }),
    prisma.stores.findFirst({ where: { user_id: actorId }, select: { store_name: true } }),
    prisma.companies.findFirst({ where: { user_id: actorId }, select: { display_name: true, company_name: true } }),
  ])

  const name =
    talent?.display_name?.trim() ||
    talent?.stage_name?.trim() ||
    talent?.name?.trim() ||
    store?.store_name?.trim() ||
    company?.display_name?.trim() ||
    company?.company_name?.trim() ||
    null

  return name || fallbackName || null
}
