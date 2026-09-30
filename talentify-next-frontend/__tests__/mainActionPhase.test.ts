import { resolveMainActionPhase } from '@/lib/offers/mainActionPhase'

describe('resolveMainActionPhase', () => {
  it('starts with estimate waiting while the offer is under consultation', () => {
    const phase = resolveMainActionPhase({
      role: 'talent',
      status: 'pending',
      invoiceStatus: 'not_created',
      paid: false,
      reviewCompleted: false,
    })

    expect(phase).toBe('estimate_waiting')
  })

  it('shows hall review after the estimate is submitted', () => {
    const phase = resolveMainActionPhase({
      role: 'store',
      status: 'pending',
      invoiceStatus: 'submitted',
      paid: false,
      reviewCompleted: false,
    })

    expect(phase).toBe('estimate_submitted')
  })

  it('moves to payment waiting after the estimate is approved and contracted', () => {
    const phase = resolveMainActionPhase({
      role: 'store',
      status: 'confirmed',
      invoiceStatus: 'approved',
      paid: false,
      reviewCompleted: false,
    })

    expect(phase).toBe('contracted_payment_waiting')
  })
})
