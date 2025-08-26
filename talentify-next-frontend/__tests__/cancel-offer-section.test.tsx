import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import CancelOfferSection from '@/app/store/offers/[id]/CancelOfferSection'

jest.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: jest.fn() }),
}))

jest.mock('@/utils/supabase/client', () => ({
  createClient: () => ({
    from: () => ({
      update: () => ({ eq: () => ({ select: () => ({ single: () => Promise.resolve({ data: {}, error: null }) }) }) }),
    }),
  }),
}))

describe('CancelOfferSection', () => {
  it('renders cancel button when status is cancellable', () => {
    const html = renderToStaticMarkup(
      <CancelOfferSection offerId="1" initialStatus="pending" />
    )
    expect(html).toContain('オファーをキャンセル')
  })

  it('renders banner when already canceled', () => {
    const html = renderToStaticMarkup(
      <CancelOfferSection offerId="1" initialStatus="canceled" />
    )
    expect(html).toContain('キャンセル済み')
  })

  it('renders nothing when status is not cancellable', () => {
    const html = renderToStaticMarkup(
      <CancelOfferSection offerId="1" initialStatus="completed" />
    )
    expect(html).toBe('')
  })
})

