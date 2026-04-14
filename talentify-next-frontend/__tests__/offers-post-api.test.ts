import { NextRequest } from 'next/server'
import { POST } from '@/app/api/offers/route'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { createOffer, findExistingOfferForCreate, findOfferAccessById, findStoreByIdForAuthUser } from '@/lib/repositories/offers'
import { emitNotification } from '@/lib/notifications/emit'

jest.mock('@/lib/auth/getCurrentUser', () => ({
  getCurrentUser: jest.fn(),
}))

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}))

jest.mock('@/lib/repositories/offers', () => ({
  createOffer: jest.fn(),
  findExistingOfferForCreate: jest.fn(),
  findStoreByIdForAuthUser: jest.fn(),
  findOfferAccessById: jest.fn(),
  findStoreOffersByAuthUser: jest.fn(),
  OfferCreateConflictError: class OfferCreateConflictError extends Error {},
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

jest.mock('@/lib/notifications/emit', () => ({
  emitNotification: jest.fn(),
}))

const { createClient } = jest.requireMock('@/lib/supabase/server') as {
  createClient: jest.Mock
}

const mockedGetCurrentUser = getCurrentUser as jest.MockedFunction<typeof getCurrentUser>
const mockedFindStoreByIdForAuthUser = findStoreByIdForAuthUser as jest.MockedFunction<typeof findStoreByIdForAuthUser>
const mockedFindExistingOfferForCreate = findExistingOfferForCreate as jest.MockedFunction<
  typeof findExistingOfferForCreate
>
const mockedFindOfferAccessById = findOfferAccessById as jest.MockedFunction<typeof findOfferAccessById>
const mockedCreateOffer = createOffer as jest.MockedFunction<typeof createOffer>
const mockedEmitNotification = emitNotification as jest.MockedFunction<typeof emitNotification>

describe('POST /api/offers', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedGetCurrentUser.mockResolvedValue({ user: { id: 'u-default' }, error: null })
    mockedFindOfferAccessById.mockResolvedValue({ store_user_id: 'u1', talent_user_id: 'u2' })
    mockedEmitNotification.mockResolvedValue(undefined as never)
  })

  it('returns 400 for validation error', async () => {
    const req = new NextRequest('http://localhost/api/offers', {
      method: 'POST',
      body: JSON.stringify({
        store_id: 'store-1',
        talent_id: 'talent-1',
        date: '2099-01-01',
        time_range: '10:00~',
        agreed: false,
      }),
    })

    const res = await POST(req)

    expect(res.status).toBe(400)
    await expect(res.json()).resolves.toMatchObject({
      ok: false,
      code: 'VALIDATION_ERROR',
    })
    expect(createClient).not.toHaveBeenCalled()
  })

  it('returns 401 when unauthenticated', async () => {
    mockedGetCurrentUser.mockResolvedValue({ user: null, error: null })

    const req = new NextRequest('http://localhost/api/offers', {
      method: 'POST',
      body: JSON.stringify({
        store_id: 'store-1',
        talent_id: 'talent-1',
        date: '2099-01-01',
        time_range: '10:00~',
        agreed: true,
      }),
    })
    const res = await POST(req)

    expect(res.status).toBe(401)
    await expect(res.json()).resolves.toMatchObject({
      ok: false,
      code: 'UNAUTHORIZED',
    })
  })

  it('returns 403 when store ownership does not match', async () => {
    mockedGetCurrentUser.mockResolvedValue({ user: { id: 'u1' }, error: null })
    mockedFindStoreByIdForAuthUser.mockResolvedValue(null)

    const req = new NextRequest('http://localhost/api/offers', {
      method: 'POST',
      body: JSON.stringify({
        store_id: 'store-1',
        talent_id: 'talent-1',
        date: '2099-01-01',
        time_range: '10:00~',
        agreed: true,
      }),
    })
    const res = await POST(req)

    expect(res.status).toBe(403)
    await expect(res.json()).resolves.toMatchObject({
      ok: false,
      code: 'FORBIDDEN',
    })
    expect(mockedCreateOffer).not.toHaveBeenCalled()
  })

  it('returns existing offer for idempotent create', async () => {
    mockedGetCurrentUser.mockResolvedValue({ user: { id: 'u1' }, error: null })
    mockedFindStoreByIdForAuthUser.mockResolvedValue({ id: 'store-1', user_id: 'u1' })
    mockedFindExistingOfferForCreate.mockResolvedValue({
      id: 'offer-existing',
      user_id: 'u1',
      store_id: 'store-1',
      talent_id: 'talent-1',
      date: new Date('2099-01-01T00:00:00.000Z'),
      time_range: '10:00~',
      agreed: true,
      message: '',
      status: 'pending',
    } as Awaited<ReturnType<typeof findExistingOfferForCreate>>)

    const req = new NextRequest('http://localhost/api/offers', {
      method: 'POST',
      body: JSON.stringify({
        store_id: 'store-1',
        talent_id: 'talent-1',
        date: '2099-01-01',
        time_range: '10:00~',
        agreed: true,
      }),
    })
    const res = await POST(req)

    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toMatchObject({
      ok: true,
      offer: { id: 'offer-existing' },
    })
    expect(mockedCreateOffer).not.toHaveBeenCalled()
  })

  it('creates new offer successfully', async () => {
    mockedGetCurrentUser.mockResolvedValue({ user: { id: 'u1' }, error: null })
    mockedFindStoreByIdForAuthUser.mockResolvedValue({ id: 'store-1', user_id: 'u1' })
    mockedFindExistingOfferForCreate.mockResolvedValue(null)
    mockedCreateOffer.mockResolvedValue({
      id: 'offer-new',
      user_id: 'u1',
      store_id: 'store-1',
      talent_id: 'talent-1',
      date: new Date('2099-01-01T00:00:00.000Z'),
      time_range: '10:00~',
      agreed: true,
      message: '',
      status: 'pending',
    } as Awaited<ReturnType<typeof createOffer>>)

    const req = new NextRequest('http://localhost/api/offers', {
      method: 'POST',
      body: JSON.stringify({
        store_id: 'store-1',
        talent_id: 'talent-1',
        date: '2099-01-01',
        time_range: '10:00~',
        agreed: true,
      }),
    })
    const res = await POST(req)

    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toMatchObject({
      ok: true,
      offer: { id: 'offer-new' },
    })
    expect(mockedCreateOffer).toHaveBeenCalled()
  })
})
