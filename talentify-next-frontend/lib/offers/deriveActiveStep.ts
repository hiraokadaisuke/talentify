import type { OfferStepKey } from '@/utils/offerProgress'

export type DeriveActiveStepParams = {
  status: string
  invoiceStatus: 'not_created' | 'draft' | 'submitted' | 'approved' | 'paid'
  paid: boolean
  paidAt?: string | null
  reviewedAt?: string | null
}

export function deriveActiveStep({
  status,
  invoiceStatus,
  paid,
  paidAt,
  reviewedAt,
}: DeriveActiveStepParams): OfferStepKey {
  if (reviewedAt) return 'review'
  if (paidAt || paid || invoiceStatus === 'paid') return 'payment'
  if (invoiceStatus === 'approved' || status === 'confirmed') return 'visit'
  if (invoiceStatus === 'submitted' || invoiceStatus === 'draft') return 'estimate'
  return 'offer_consultation'
}
