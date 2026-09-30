export type MainActionRole = 'store' | 'talent'

export type MainActionPhase =
  | 'estimate_waiting'
  | 'estimate_draft'
  | 'estimate_submitted'
  | 'contracted_payment_waiting'
  | 'payment_completed_review_waiting'
  | 'review_available'
  | 'completed'

interface MainActionPhaseParams {
  role: MainActionRole
  status: string
  invoiceStatus: 'not_created' | 'draft' | 'submitted' | 'approved' | 'paid'
  paid: boolean
  reviewCompleted: boolean
}

export function resolveMainActionPhase({
  role,
  status,
  invoiceStatus,
  paid,
  reviewCompleted,
}: MainActionPhaseParams): MainActionPhase {
  const paymentDone = paid || invoiceStatus === 'paid'

  if (paymentDone && reviewCompleted) return 'completed'
  if (paymentDone) {
    return role === 'store' ? 'payment_completed_review_waiting' : 'payment_completed_review_waiting'
  }

  if (invoiceStatus === 'approved' || status === 'confirmed') return 'contracted_payment_waiting'
  if (invoiceStatus === 'submitted') return 'estimate_submitted'
  if (invoiceStatus === 'draft') return 'estimate_draft'
  return 'estimate_waiting'
}
