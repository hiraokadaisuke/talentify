import { NextRequest } from 'next/server'
import { GET } from '@/app/api/offers/[id]/route'
import { findOfferByIdForAuthUser } from '@/lib/repositories/offers'

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}))

jest.mock('@/lib/repositories/offers', () => ({
  findOfferByIdForAuthUser: jest.fn(),
}))

const { createClient } = jest.requireMock('@/lib/supabase/server') as {
  createClient: jest.Mock
}

const mockedFindOfferByIdForAuthUser = findOfferByIdForAuthUser as jest.MockedFunction<typeof findOfferByIdForAuthUser>

describe('GET /api/offers/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns 401 when unauthenticated', async () => {
    createClient.mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      },
    })

    const req = new NextRequest('http://localhost/api/offers/offer-1')
    const res = await GET(req, { params: { id: 'offer-1' } })

    expect(res.status).toBe(401)
    await expect(res.json()).resolves.toMatchObject({ error: '認証が必要です' })
    expect(mockedFindOfferByIdForAuthUser).not.toHaveBeenCalled()
  })

  it('returns 404 when offer is not accessible or does not exist', async () => {
    createClient.mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'u1' } }, error: null }),
      },
    })
    mockedFindOfferByIdForAuthUser.mockResolvedValue(null)

    const req = new NextRequest('http://localhost/api/offers/offer-404')
    const res = await GET(req, { params: { id: 'offer-404' } })

    expect(res.status).toBe(404)
    await expect(res.json()).resolves.toMatchObject({ error: 'オファーが見つかりません' })
    expect(mockedFindOfferByIdForAuthUser).toHaveBeenCalledWith({ offerId: 'offer-404', userId: 'u1' })
  })

  it('returns offer detail for authorized user', async () => {
    createClient.mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'u2' } }, error: null }),
      },
    })
    mockedFindOfferByIdForAuthUser.mockResolvedValue({
      id: 'offer-2',
      store_id: 'store-1',
      talent_id: 'talent-1',
      status: 'pending',
      date: new Date('2026-04-01T00:00:00.000Z'),
      time_range: '10:00-12:00',
      message: 'hello',
      agreed: true,
      created_at: new Date('2026-03-01T00:00:00.000Z'),
      updated_at: new Date('2026-03-02T00:00:00.000Z'),
      contract_url: null,
      invoice_url: null,
      invoice_submitted: false,
      invoice_date: null,
      invoice_amount: null,
      store_name: 'Store A',
      talent_display_name: 'Talent B',
    })

    const req = new NextRequest('http://localhost/api/offers/offer-2')
    const res = await GET(req, { params: { id: 'offer-2' } })

    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toMatchObject({
      data: {
        id: 'offer-2',
        status: 'pending',
        store_name: 'Store A',
      },
    })
  })

  it('returns 404 for out-of-scope user access', async () => {
    createClient.mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'u-no-access' } }, error: null }),
      },
    })
    mockedFindOfferByIdForAuthUser.mockResolvedValue(null)

    const req = new NextRequest('http://localhost/api/offers/offer-private')
    const res = await GET(req, { params: { id: 'offer-private' } })

    expect(res.status).toBe(404)
    await expect(res.json()).resolves.toMatchObject({ error: 'オファーが見つかりません' })
  })
})
