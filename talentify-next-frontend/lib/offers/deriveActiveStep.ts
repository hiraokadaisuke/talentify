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

export function deriveActiveStep({
  status,
  invoiceStatus,
  paid,
  paidAt,
  reviewedAt,
}: DeriveActiveStepParams): OfferStepKey {
  if (reviewedAt) return 'review'
  if (paidAt || paid || invoiceStatus === 'paid') return 'payment'
  if (status === 'completed') return 'payment'
  if (status === 'confirmed' || status === 'accepted') return 'visit'
  if (invoiceStatus === 'submitted') return 'invoice'
  return 'approval'
}
