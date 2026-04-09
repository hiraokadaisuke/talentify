import { getPrismaClient } from '@/lib/prisma'

export const OFFER_STATUS_TYPES = [
  'draft',
  'pending',
  'approved',
  'rejected',
  'completed',
  'offer_created',
  'confirmed',
  'canceled',
  'no_show',
  'submitted',
] as const

export type OfferStatusType = (typeof OFFER_STATUS_TYPES)[number]

export type StoreOfferListItem = {
  id: string
  store_id: string | null
  talent_id: string | null
  status: OfferStatusType | null
  date: Date
  time_range: string | null
  message: string | null
  agreed: boolean | null
  created_at: Date | null
  updated_at: Date | null
}

type FindStoreOffersParams = {
  userId: string
  status?: OfferStatusType
}

export async function findStoreOffersByAuthUser({
  userId,
  status,
}: FindStoreOffersParams): Promise<StoreOfferListItem[]> {
  const prisma = getPrismaClient()

  const store = await prisma.stores.findUnique({
    where: { user_id: userId },
    select: { id: true },
  })

  if (!store) {
    return []
  }

  const offers = await prisma.offers.findMany({
    where: {
      store_id: store.id,
      ...(status ? { status } : {}),
    },
    select: {
      id: true,
      store_id: true,
      talent_id: true,
      status: true,
      date: true,
      time_range: true,
      message: true,
      agreed: true,
      created_at: true,
      updated_at: true,
    },
    orderBy: {
      created_at: 'desc',
    },
  })

  return offers
}
