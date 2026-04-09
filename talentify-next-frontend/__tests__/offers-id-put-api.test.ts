import { NextRequest } from 'next/server'
import { PUT } from '@/app/api/offers/[id]/route'
import { findOfferAccessById } from '@/lib/repositories/offers'

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}))

jest.mock('@/lib/repositories/offers', () => ({
  findOfferByIdForAuthUser: jest.fn(),
  findOfferAccessById: jest.fn(),
}))

const { createClient } = jest.requireMock('@/lib/supabase/server') as {
  createClient: jest.Mock
}

const mockedFindOfferAccessById = findOfferAccessById as jest.MockedFunction<typeof findOfferAccessById>

function buildSupabaseClient(userId: string | null) {
  const eq = jest.fn().mockResolvedValue({ error: null })
  const update = jest.fn().mockReturnValue({ eq })
  const from = jest.fn().mockReturnValue({ update })

  return {
    client: {
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: userId ? { id: userId } : null }, error: null }),
      },
      from,
    },
    spies: {
      from,
      update,
      eq,
    },
  }
}

describe('PUT /api/offers/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns 404 when offer does not exist', async () => {
    const supabase = buildSupabaseClient('u1')
    createClient.mockResolvedValue(supabase.client)
    mockedFindOfferAccessById.mockResolvedValue(null)

    const req = new NextRequest('http://localhost/api/offers/offer-404', {
      method: 'PUT',
      body: JSON.stringify({ status: 'approved' }),
    })
    const res = await PUT(req, { params: { id: 'offer-404' } })

    expect(res.status).toBe(404)
    await expect(res.json()).resolves.toMatchObject({ error: 'オファーが見つかりません' })
    expect(supabase.spies.from).not.toHaveBeenCalled()
  })

  it('returns 403 when user is not store/talent owner', async () => {
    const supabase = buildSupabaseClient('u-other')
    createClient.mockResolvedValue(supabase.client)
    mockedFindOfferAccessById.mockResolvedValue({
      store_user_id: 'u-store',
      talent_user_id: 'u-talent',
    })

    const req = new NextRequest('http://localhost/api/offers/offer-1', {
      method: 'PUT',
      body: JSON.stringify({ status: 'approved' }),
    })
    const res = await PUT(req, { params: { id: 'offer-1' } })

    expect(res.status).toBe(403)
    await expect(res.json()).resolves.toMatchObject({ error: '権限がありません' })
    expect(supabase.spies.from).not.toHaveBeenCalled()
  })

  it('updates allowed fields for store owner', async () => {
    const supabase = buildSupabaseClient('u-store')
    createClient.mockResolvedValue(supabase.client)
    mockedFindOfferAccessById.mockResolvedValue({
      store_user_id: 'u-store',
      talent_user_id: 'u-talent',
    })

    const req = new NextRequest('http://localhost/api/offers/offer-1', {
      method: 'PUT',
      body: JSON.stringify({ contract_url: 'https://example.com/contract' }),
    })
    const res = await PUT(req, { params: { id: 'offer-1' } })

    expect(res.status).toBe(200)
    expect(supabase.spies.from).toHaveBeenCalledWith('offers')
    expect(supabase.spies.update).toHaveBeenCalledWith({
      contract_url: 'https://example.com/contract',
    })
    expect(supabase.spies.eq).toHaveBeenCalledWith('id', 'offer-1')
  })

  it('updates allowed fields for talent owner', async () => {
    const supabase = buildSupabaseClient('u-talent')
    createClient.mockResolvedValue(supabase.client)
    mockedFindOfferAccessById.mockResolvedValue({
      store_user_id: 'u-store',
      talent_user_id: 'u-talent',
    })

    const req = new NextRequest('http://localhost/api/offers/offer-1', {
      method: 'PUT',
      body: JSON.stringify({ agreed: true }),
    })
    const res = await PUT(req, { params: { id: 'offer-1' } })

    expect(res.status).toBe(200)
    expect(supabase.spies.update).toHaveBeenCalledWith({ agreed: true })
    expect(supabase.spies.eq).toHaveBeenCalledWith('id', 'offer-1')
  })
})
