import type { OfferStepKey } from '@/utils/offerProgress'

export type DeriveActiveStepParams = {
  status: string
  submittedAt?: string | null
  acceptedAt?: string | null
  visitScheduledAt?: string | null
  visitDoneAt?: string | null
  invoiceStatus: 'not_submitted' | 'submitted' | 'paid'
  invoiceIssuedAt?: string | null
  paid: boolean
  paidAt?: string | null
  reviewedAt?: string | null
}

/**
 * Derives the most relevant active step for an offer based on the
 * progression timestamps and status.
 */
export function deriveActiveStep({
  status,
  acceptedAt,
  visitDoneAt,
  visitScheduledAt,
  invoiceStatus,
  invoiceIssuedAt,
  paid,
  paidAt,
  reviewedAt,
}: DeriveActiveStepParams): OfferStepKey {
  if (reviewedAt) {
    return 'review'
  }

  if (paidAt || paid || invoiceStatus === 'paid') {
    return 'payment'
  }

  if (invoiceIssuedAt || invoiceStatus === 'submitted') {
    return 'invoice'
  }

  if (visitDoneAt || status === 'completed') {
    return 'visit'
  }

  if (acceptedAt || ['accepted', 'confirmed'].includes(status)) {
    return 'approval'
  }

  if (visitScheduledAt) {
    return 'visit'
  }

  return 'offer_submitted'
}
