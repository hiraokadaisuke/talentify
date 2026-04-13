import { deriveOfferInvoiceProgressStatus, getInvoiceStatusLabel, getPaymentStatusLabel } from '@/lib/invoices/status'

describe('invoices status helpers', () => {
  it('maps invoice status labels', () => {
    expect(getInvoiceStatusLabel('draft')).toBe('未提出')
    expect(getInvoiceStatusLabel('submitted')).toBe('提出済み')
    expect(getInvoiceStatusLabel('approved')).toBe('承認済み')
  })

  it('derives offer invoice status from invoice.status as source of truth', () => {
    expect(deriveOfferInvoiceProgressStatus({ invoiceStatus: 'draft' })).toBe('not_submitted')
    expect(deriveOfferInvoiceProgressStatus({ invoiceStatus: 'submitted' })).toBe('submitted')
  })

  it('treats payment completion as paid progress', () => {
    expect(
      deriveOfferInvoiceProgressStatus({
        invoiceStatus: 'submitted',
        invoicePaymentStatus: 'paid',
      })
    ).toBe('paid')
    expect(getPaymentStatusLabel('unpaid', true)).toBe('支払済み')
  })
})
