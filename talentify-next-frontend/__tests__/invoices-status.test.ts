import { deriveOfferInvoiceProgressStatus, getInvoiceStatusLabel, getPaymentStatusLabel } from '@/lib/invoices/status'

describe('invoices status helpers', () => {
  it('maps estimate and contract status labels', () => {
    expect(getInvoiceStatusLabel('draft')).toBe('見積作成中')
    expect(getInvoiceStatusLabel('submitted')).toBe('見積提出済み')
    expect(getInvoiceStatusLabel('approved')).toBe('締結済み')
  })

  it('derives estimate-to-contract progress from document status', () => {
    expect(deriveOfferInvoiceProgressStatus({ invoiceStatus: undefined })).toBe('not_created')
    expect(deriveOfferInvoiceProgressStatus({ invoiceStatus: 'draft' })).toBe('draft')
    expect(deriveOfferInvoiceProgressStatus({ invoiceStatus: 'submitted' })).toBe('submitted')
    expect(deriveOfferInvoiceProgressStatus({ invoiceStatus: 'approved' })).toBe('approved')
  })

  it('treats payment completion as paid progress', () => {
    expect(
      deriveOfferInvoiceProgressStatus({
        invoiceStatus: 'approved',
        invoicePaymentStatus: 'paid',
      })
    ).toBe('paid')
    expect(getPaymentStatusLabel('unpaid', true)).toBe('支払済み')
  })
})
