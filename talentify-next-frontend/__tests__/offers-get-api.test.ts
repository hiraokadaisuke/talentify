import { NextRequest } from 'next/server'
import { GET } from '@/app/api/offers/route'
import { findStoreOffersByAuthUser } from '@/lib/repositories/offers'

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}))

jest.mock('@/lib/repositories/offers', () => ({
  findStoreOffersByAuthUser: jest.fn(),
  OFFER_STATUS_TYPES: [
    'draft',
    'pending',
    'approved',
    'rejected',
    'completed',
    'offer_created',
    'confirmed',
    'canceled',
    'no_show',
    'submitted',
  ],
}))

const { createClient } = jest.requireMock('@/lib/supabase/server') as {
  createClient: jest.Mock
}

const mockedFindStoreOffersByAuthUser = findStoreOffersByAuthUser as jest.MockedFunction<typeof findStoreOffersByAuthUser>

describe('GET /api/offers', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns 401 when unauthenticated', async () => {
    createClient.mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
      },
    })

    const req = new NextRequest('http://localhost/api/offers')
    const res = await GET(req)

    expect(res.status).toBe(401)
    await expect(res.json()).resolves.toMatchObject({
      ok: false,
      code: 'UNAUTHORIZED',
    })
    expect(mockedFindStoreOffersByAuthUser).not.toHaveBeenCalled()
  })

  it('returns 400 for invalid status query', async () => {
    createClient.mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'u1' } } }),
      },
    })

    const req = new NextRequest('http://localhost/api/offers?status=invalid')
    const res = await GET(req)

    expect(res.status).toBe(400)
    await expect(res.json()).resolves.toMatchObject({
      ok: false,
      code: 'VALIDATION_ERROR',
    })
    expect(mockedFindStoreOffersByAuthUser).not.toHaveBeenCalled()
  })

  it('normalizes status query and returns offer list', async () => {
    createClient.mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'u2' } } }),
      },
    })
    mockedFindStoreOffersByAuthUser.mockResolvedValue([
      {
        id: 'offer-1',
        store_id: 'store-1',
        talent_id: 'talent-1',
        status: 'pending',
        date: new Date('2026-04-01'),
        time_range: '10:00-12:00',
        message: 'hello',
        agreed: true,
        created_at: new Date('2026-03-01'),
        updated_at: new Date('2026-03-02'),
      },
    ])

    const req = new NextRequest('http://localhost/api/offers?status=%20PENDING%20')
    const res = await GET(req)

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.ok).toBe(true)
    expect(Array.isArray(body.offers)).toBe(true)
    expect(mockedFindStoreOffersByAuthUser).toHaveBeenCalledWith({
      userId: 'u2',
      status: 'pending',
    })
  })

  it('returns empty list when store is not linked', async () => {
    createClient.mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'u3' } } }),
      },
    })
    mockedFindStoreOffersByAuthUser.mockResolvedValue([])

    const req = new NextRequest('http://localhost/api/offers')
    const res = await GET(req)

    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toEqual({ ok: true, offers: [] })
  })
})
