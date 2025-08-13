import { validateOfferPayload } from '@/app/api/offers/route'

describe('validateOfferPayload', () => {
  it('returns error when agreed is false', () => {
    const err = validateOfferPayload({
      store_id: 's',
      talent_id: 't',
      date: '2099-01-01',
      time_range: '10:00~',
      agreed: false,
      message: 'm',
    })
    expect(err).toBe('agreed must be true')
  })

  it('passes with valid data', () => {
    const err = validateOfferPayload({
      store_id: 's',
      talent_id: 't',
      date: '2099-01-01',
      time_range: '10:00~',
      agreed: true,
      message: 'm',
    })
    expect(err).toBeNull()
  })
})
