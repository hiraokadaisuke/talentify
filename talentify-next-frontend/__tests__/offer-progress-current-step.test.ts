import { getOfferProgress } from '@/utils/offerProgress'

describe('offer progress current step', () => {
  it('keeps an accepted offer on estimate creation while no estimate exists', () => {
    const result = getOfferProgress({
      status: 'accepted',
      invoiceStatus: 'not_submitted',
      paid: false,
      reviewCompleted: false,
    })

    expect(result.current).toBe('approval')
  })

  it('moves to estimate confirmation when an estimate has been submitted', () => {
    const result = getOfferProgress({
      status: 'accepted',
      invoiceStatus: 'submitted',
      paid: false,
      reviewCompleted: false,
    })

    expect(result.current).toBe('invoice')
  })

  it('moves to the visit step after the transaction is confirmed', () => {
    const result = getOfferProgress({
      status: 'confirmed',
      invoiceStatus: 'submitted',
      paid: false,
      reviewCompleted: false,
    })

    expect(result.current).toBe('visit')
  })

  it('moves to payment after the visit is completed', () => {
    const result = getOfferProgress({
      status: 'completed',
      invoiceStatus: 'submitted',
      paid: false,
      reviewCompleted: false,
    })

    expect(result.current).toBe('payment')
  })

  it('moves to review after payment', () => {
    const result = getOfferProgress({
      status: 'completed',
      invoiceStatus: 'paid',
      paid: true,
      reviewCompleted: false,
    })

    expect(result.current).toBe('review')
  })
})
