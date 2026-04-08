import { prisma } from '@/lib/prisma'

export const OFFER_STATUS_FILTERS = [
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

export type OfferStatusFilter = (typeof OFFER_STATUS_FILTERS)[number]

export interface FindOffersInput {
  storeId: string
  status?: OfferStatusFilter
}

export interface OfferListItem {
  id: string
  store_id: string | null
  talent_id: string | null
  status: OfferStatusFilter | null
  date: Date
  time_range: string | null
  message: string | null
  created_at: Date | null
  updated_at: Date | null
  agreed: boolean | null
}

export async function findStoreIdByUserId(userId: string): Promise<string | null> {
  const store = await prisma.stores.findUnique({
    where: { user_id: userId },
    select: { id: true },
  })

  return store?.id ?? null
}

export async function findOffers(input: FindOffersInput): Promise<OfferListItem[]> {
  const offers = await prisma.offers.findMany({
    where: {
      store_id: input.storeId,
      ...(input.status ? { status: input.status } : {}),
    },
    orderBy: {
      created_at: 'desc',
    },
    select: {
      id: true,
      store_id: true,
      talent_id: true,
      status: true,
      date: true,
      time_range: true,
      message: true,
      created_at: true,
      updated_at: true,
      agreed: true,
    },
  })

  return offers
}
