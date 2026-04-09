import { getPrismaClient } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

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

export type OfferDetailForUser = {
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
  contract_url: string | null
  invoice_url: string | null
  invoice_submitted: boolean | null
  invoice_date: Date | null
  invoice_amount: number | null
  store_name: string | null
  talent_display_name: string | null
}

type FindStoreOffersParams = {
  userId: string
  status?: OfferStatusType
}

type FindOfferByIdForAuthUserParams = {
  offerId: string
  userId: string
}

type FindStoreByIdForAuthUserParams = {
  storeId: string
  userId: string
}

type FindExistingOfferForCreateParams = {
  storeId: string
  talentId: string
  date: Date
  timeRange: string
}

export type OfferCreateInput = {
  user_id: string
  store_id: string
  talent_id: string
  date: Date
  time_range: string
  agreed: boolean
  message: string
  status: OfferStatusType
}

export class OfferCreateConflictError extends Error {
  constructor() {
    super('offer create conflict')
    this.name = 'OfferCreateConflictError'
  }
}

export type OfferAccessForUpdate = {
  store_user_id: string | null
  talent_user_id: string | null
}

export type OfferUpdateInput = Record<string, unknown>

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

export async function findOfferByIdForAuthUser({
  offerId,
  userId,
}: FindOfferByIdForAuthUserParams): Promise<OfferDetailForUser | null> {
  const prisma = getPrismaClient()

  const offer = await prisma.offers.findFirst({
    where: {
      id: offerId,
      OR: [{ stores: { is: { user_id: userId } } }, { talents: { is: { user_id: userId } } }],
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
      contract_url: true,
      invoice_url: true,
      invoice_submitted: true,
      invoice_date: true,
      invoice_amount: true,
      stores: {
        select: {
          store_name: true,
        },
      },
      talents: {
        select: {
          display_name: true,
          name: true,
        },
      },
    },
  })

  if (!offer) {
    return null
  }

  return {
    id: offer.id,
    store_id: offer.store_id,
    talent_id: offer.talent_id,
    status: offer.status,
    date: offer.date,
    time_range: offer.time_range,
    message: offer.message,
    agreed: offer.agreed,
    created_at: offer.created_at,
    updated_at: offer.updated_at,
    contract_url: offer.contract_url,
    invoice_url: offer.invoice_url,
    invoice_submitted: offer.invoice_submitted,
    invoice_date: offer.invoice_date,
    invoice_amount: offer.invoice_amount,
    store_name: offer.stores?.store_name ?? null,
    talent_display_name: offer.talents?.display_name ?? offer.talents?.name ?? null,
  }
}

export async function findStoreByIdForAuthUser({
  storeId,
  userId,
}: FindStoreByIdForAuthUserParams): Promise<{ id: string; user_id: string | null } | null> {
  const prisma = getPrismaClient()

  const store = await prisma.stores.findFirst({
    where: {
      id: storeId,
      user_id: userId,
    },
    select: {
      id: true,
      user_id: true,
    },
  })

  return store
}

export async function findExistingOfferForCreate({
  storeId,
  talentId,
  date,
  timeRange,
}: FindExistingOfferForCreateParams) {
  const prisma = getPrismaClient()

  const offer = await prisma.offers.findFirst({
    where: {
      store_id: storeId,
      talent_id: talentId,
      date,
      time_range: timeRange,
    },
    orderBy: {
      created_at: 'desc',
    },
  })

  return offer
}

export async function createOffer(input: OfferCreateInput) {
  const prisma = getPrismaClient()

  try {
    const offer = await prisma.offers.create({
      data: input,
    })
    return offer
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new OfferCreateConflictError()
    }
    throw error
  }
}

export async function findOfferAccessById(offerId: string): Promise<OfferAccessForUpdate | null> {
  const prisma = getPrismaClient()

  const offer = await prisma.offers.findUnique({
    where: { id: offerId },
    select: {
      stores: {
        select: {
          user_id: true,
        },
      },
      talents: {
        select: {
          user_id: true,
        },
      },
    },
  })

  if (!offer) {
    return null
  }

  return {
    store_user_id: offer.stores?.user_id ?? null,
    talent_user_id: offer.talents?.user_id ?? null,
  }
}

export async function updateOfferById(offerId: string, updates: OfferUpdateInput): Promise<number> {
  const prisma = getPrismaClient()

  const result = await prisma.offers.updateMany({
    where: { id: offerId },
    data: updates as Prisma.offersUpdateManyMutationInput,
  })

  return result.count
}
