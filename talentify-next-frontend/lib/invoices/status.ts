export type InvoiceStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | string | null | undefined
export type PaymentStatus = 'paid' | 'unpaid' | string | null | undefined
export type OfferInvoiceProgressStatus = 'not_submitted' | 'submitted' | 'paid'

export function getInvoiceStatusLabel(status: InvoiceStatus): string {
  switch (status) {
    case 'draft':
      return '未提出'
    case 'submitted':
      return '提出済み'
    case 'approved':
      return '承認済み'
    case 'rejected':
      return '差し戻し'
    default:
      return status ?? '-'
  }
}

export function isPaymentCompleted(paymentStatus: PaymentStatus, offerPaid?: boolean | null): boolean {
  return paymentStatus === 'paid' || offerPaid === true
}

export function getPaymentStatusLabel(paymentStatus: PaymentStatus, offerPaid?: boolean | null): string {
  return isPaymentCompleted(paymentStatus, offerPaid) ? '支払済み' : '未払い'
}

export function deriveOfferInvoiceProgressStatus(params: {
  invoiceStatus?: InvoiceStatus
  invoicePaymentStatus?: PaymentStatus
  offerPaid?: boolean | null
  paymentStatus?: string | null
}): OfferInvoiceProgressStatus {
  const { invoiceStatus, invoicePaymentStatus, offerPaid, paymentStatus } = params
  const paymentCompleted = paymentStatus === 'completed' || isPaymentCompleted(invoicePaymentStatus, offerPaid)

  if (paymentCompleted) return 'paid'
  if (invoiceStatus === 'submitted' || invoiceStatus === 'approved' || invoiceStatus === 'rejected') {
    return 'submitted'
  }
  return 'not_submitted'
}
