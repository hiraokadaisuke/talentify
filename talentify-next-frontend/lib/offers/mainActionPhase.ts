export type MainActionRole = 'store' | 'talent'

export type MainActionPhase =
  | 'before_invoice'
  | 'invoice_waiting'
  | 'invoice_submitted'
  | 'payment_waiting'
  | 'payment_completed_review_waiting'
  | 'review_available'
  | 'completed'

interface MainActionPhaseParams {
  role: MainActionRole
  status: string
  invoiceStatus: 'not_submitted' | 'submitted' | 'paid'
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
  const invoiceCreated = invoiceStatus !== 'not_submitted'
  const canStartInvoiceFlow = ['accepted', 'confirmed', 'completed'].includes(status)

  if (paymentDone && reviewCompleted) {
    return 'completed'
  }

  if (paymentDone) {
    if (role === 'store') {
      return 'payment_completed_review_waiting'
    }
    return reviewCompleted ? 'review_available' : 'payment_completed_review_waiting'
  }

  if (invoiceStatus === 'submitted') {
    return role === 'store' ? 'invoice_submitted' : 'payment_waiting'
  }

  if (!invoiceCreated && canStartInvoiceFlow) {
    return 'invoice_waiting'
  }

  return 'before_invoice'
}
