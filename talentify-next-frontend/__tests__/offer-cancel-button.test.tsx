import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import OfferCancelButton from '@/components/offers/OfferCancelButton';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: jest.fn() }),
}));

jest.mock('@/utils/supabase/client', () => ({
  createClient: () => ({
    from: () => ({
      update: () => ({ eq: () => Promise.resolve({ error: null }) }),
    }),
  }),
}));

describe('OfferCancelButton', () => {
  it('is disabled when status is not cancellable', () => {
    const html = renderToStaticMarkup(
      <OfferCancelButton offerId="1" currentStatus="canceled" />
    );
    expect(html).toContain('disabled');
  });

  it('is enabled when status is cancellable', () => {
    const html = renderToStaticMarkup(
      <OfferCancelButton offerId="1" currentStatus="pending" />
    );
    // button without disabled attribute
    expect(html).not.toContain('disabled');
  });
});
