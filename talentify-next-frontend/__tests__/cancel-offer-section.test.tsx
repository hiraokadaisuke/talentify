import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import CancelOfferSection from '@/app/store/offers/[id]/CancelOfferSection'

jest.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: jest.fn() }),
}))

describe('CancelOfferSection', () => {
  it('renders pre-contract withdrawal action for a pending store offer', () => {
    const html = renderToStaticMarkup(
      <CancelOfferSection offerId="1" initialStatus="pending" />
    )
    expect(html).toContain('オファーを取り下げる')
  })

  it('renders contract cancellation action for a confirmed offer', () => {
    const html = renderToStaticMarkup(
      <CancelOfferSection offerId="1" initialStatus="confirmed" invoiceId="invoice-1" />
    )
    expect(html).toContain('契約をキャンセル')
  })

  it('renders structured cancellation details when already canceled', () => {
    const html = renderToStaticMarkup(
      <CancelOfferSection
        offerId="1"
        initialStatus="canceled"
        initialCanceledAt="2026-10-01T01:00:00.000Z"
        initialCanceledByRole="store"
        initialCancelReason="店舗都合により日程の実施が難しくなったため"
        initialCancellationPhase="post_contract"
        invoiceId="invoice-1"
      />
    )
    expect(html).toContain('キャンセル済み')
    expect(html).toContain('契約成立後')
    expect(html).toContain('店舗都合により日程の実施が難しくなったため')
    expect(html).toContain('締結書兼請求書')
  })

  it('renders nothing when status is not cancellable', () => {
    const html = renderToStaticMarkup(
      <CancelOfferSection offerId="1" initialStatus="completed" />
    )
    expect(html).toBe('')
  })
})
