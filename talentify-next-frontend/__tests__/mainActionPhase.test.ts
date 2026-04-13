import { resolveMainActionPhase } from '@/lib/offers/mainActionPhase'

describe('resolveMainActionPhase', () => {
  it('returns invoice_waiting before visit completion once offer is accepted and invoice is not submitted', () => {
    const phase = resolveMainActionPhase({
      role: 'talent',
      status: 'accepted',
      invoiceStatus: 'not_submitted',
      paid: false,
      reviewCompleted: false,
    })

    expect(phase).toBe('invoice_waiting')
  })

  it('prioritizes submitted invoice phase over visit completion', () => {
    const phase = resolveMainActionPhase({
      role: 'store',
      status: 'accepted',
      invoiceStatus: 'submitted',
      paid: false,
      reviewCompleted: false,
    })

    expect(phase).toBe('invoice_submitted')
  })

  it('treats pending offers without invoice as before_invoice', () => {
    const phase = resolveMainActionPhase({
      role: 'store',
      status: 'pending',
      invoiceStatus: 'not_submitted',
      paid: false,
      reviewCompleted: false,
    })

    expect(phase).toBe('before_invoice')
  })
})
