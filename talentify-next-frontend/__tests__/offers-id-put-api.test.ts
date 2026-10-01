import { NextRequest } from 'next/server'
import { PUT } from '@/app/api/offers/[id]/route'
import { findOfferAccessById, updateOfferById } from '@/lib/repositories/offers'
import { emitNotification } from '@/lib/notifications/emit'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'

jest.mock('@/lib/auth/getCurrentUser', () => ({
  getCurrentUser: jest.fn(),
}))

jest.mock('@/lib/repositories/offers', () => ({
  findOfferByIdForAuthUser: jest.fn(),
  findOfferAccessById: jest.fn(),
  updateOfferById: jest.fn(),
}))

jest.mock('@/lib/notifications/emit', () => ({
  emitNotification: jest.fn(),
}))

const mockedFindOfferAccessById = findOfferAccessById as jest.MockedFunction<typeof findOfferAccessById>
const mockedUpdateOfferById = updateOfferById as jest.MockedFunction<typeof updateOfferById>
const mockedEmitNotification = emitNotification as jest.MockedFunction<typeof emitNotification>
const mockedGetCurrentUser = getCurrentUser as jest.MockedFunction<typeof getCurrentUser>

describe('PUT /api/offers/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedGetCurrentUser.mockResolvedValue({ user: { id: 'u-default' }, error: null })
    mockedUpdateOfferById.mockResolvedValue(1)
  })

  it('returns 404 when offer does not exist', async () => {
    mockedGetCurrentUser.mockResolvedValue({ user: { id: 'u1' }, error: null })
    mockedFindOfferAccessById.mockResolvedValue(null)

    const req = new NextRequest('http://localhost/api/offers/offer-404', {
      method: 'PUT',
      body: JSON.stringify({ status: 'confirmed' }),
    })
    const res = await PUT(req, { params: { id: 'offer-404' } })

    expect(res.status).toBe(404)
    expect(mockedUpdateOfferById).not.toHaveBeenCalled()
  })

  it('returns 403 when user is not a participant owner', async () => {
    mockedGetCurrentUser.mockResolvedValue({ user: { id: 'u-other' }, error: null })
    mockedFindOfferAccessById.mockResolvedValue({
      store_user_id: 'u-store',
      talent_user_id: 'u-talent',
      status: 'pending',
    })

    const req = new NextRequest('http://localhost/api/offers/offer-1', {
      method: 'PUT',
      body: JSON.stringify({ status: 'confirmed' }),
    })
    const res = await PUT(req, { params: { id: 'offer-1' } })

    expect(res.status).toBe(403)
    expect(mockedUpdateOfferById).not.toHaveBeenCalled()
  })

  it('rejects non-status fields', async () => {
    mockedGetCurrentUser.mockResolvedValue({ user: { id: 'u-talent' }, error: null })

    const req = new NextRequest('http://localhost/api/offers/offer-1', {
      method: 'PUT',
      body: JSON.stringify({ status: 'confirmed', invoice_amount: 999999 }),
    })
    const res = await PUT(req, { params: { id: 'offer-1' } })

    expect(res.status).toBe(400)
    expect(mockedFindOfferAccessById).not.toHaveBeenCalled()
    expect(mockedUpdateOfferById).not.toHaveBeenCalled()
  })

  it('blocks talent from accepting a pending offer directly', async () => {
    mockedGetCurrentUser.mockResolvedValue({ user: { id: 'u-talent' }, error: null })
    mockedFindOfferAccessById.mockResolvedValue({
      store_user_id: 'u-store',
      talent_user_id: 'u-talent',
      status: 'pending',
    })

    const req = new NextRequest('http://localhost/api/offers/offer-1', {
      method: 'PUT',
      body: JSON.stringify({ status: 'confirmed' }),
    })
    const res = await PUT(req, { params: { id: 'offer-1' } })

    expect(res.status).toBe(409)
    expect(mockedUpdateOfferById).not.toHaveBeenCalled()
  })

  it('allows talent to reject only a pending offer', async () => {
    mockedGetCurrentUser.mockResolvedValue({ user: { id: 'u-talent' }, error: null })
    mockedFindOfferAccessById.mockResolvedValue({
      store_user_id: 'u-store',
      talent_user_id: 'u-talent',
      status: 'pending',
    })

    const req = new NextRequest('http://localhost/api/offers/offer-1', {
      method: 'PUT',
      body: JSON.stringify({ status: 'rejected' }),
    })
    const res = await PUT(req, { params: { id: 'offer-1' } })

    expect(res.status).toBe(200)
    expect(mockedUpdateOfferById).toHaveBeenCalledWith(
      'offer-1',
      { status: 'rejected' },
      'pending'
    )
  })

  it('blocks talent from changing an already confirmed offer', async () => {
    mockedGetCurrentUser.mockResolvedValue({ user: { id: 'u-talent' }, error: null })
    mockedFindOfferAccessById.mockResolvedValue({
      store_user_id: 'u-store',
      talent_user_id: 'u-talent',
      status: 'confirmed',
    })

    const req = new NextRequest('http://localhost/api/offers/offer-1', {
      method: 'PUT',
      body: JSON.stringify({ status: 'rejected' }),
    })
    const res = await PUT(req, { params: { id: 'offer-1' } })

    expect(res.status).toBe(409)
    expect(mockedUpdateOfferById).not.toHaveBeenCalled()
  })

  it('requires the dedicated cancellation endpoint', async () => {
    mockedGetCurrentUser.mockResolvedValue({ user: { id: 'u-store' }, error: null })

    const req = new NextRequest('http://localhost/api/offers/offer-1', {
      method: 'PUT',
      body: JSON.stringify({ status: 'Cancelled' }),
    })
    const res = await PUT(req, { params: { id: 'offer-1' } })

    expect(res.status).toBe(400)
    expect(mockedFindOfferAccessById).not.toHaveBeenCalled()
    expect(mockedUpdateOfferById).not.toHaveBeenCalled()
  })

  it('blocks store from accepting, rejecting, or completing offers', async () => {
    mockedGetCurrentUser.mockResolvedValue({ user: { id: 'u-store' }, error: null })
    mockedFindOfferAccessById.mockResolvedValue({
      store_user_id: 'u-store',
      talent_user_id: 'u-talent',
      status: 'pending',
    })

    for (const status of ['confirmed', 'rejected', 'completed']) {
      const req = new NextRequest('http://localhost/api/offers/offer-1', {
        method: 'PUT',
        body: JSON.stringify({ status }),
      })
      const res = await PUT(req, { params: { id: 'offer-1' } })
      expect(res.status).toBe(409)
    }

    expect(mockedUpdateOfferById).not.toHaveBeenCalled()
  })

  it('returns 409 when the offer changed concurrently', async () => {
    mockedGetCurrentUser.mockResolvedValue({ user: { id: 'u-talent' }, error: null })
    mockedFindOfferAccessById.mockResolvedValue({
      store_user_id: 'u-store',
      talent_user_id: 'u-talent',
      status: 'pending',
    })
    mockedUpdateOfferById.mockResolvedValue(0)

    const req = new NextRequest('http://localhost/api/offers/offer-1', {
      method: 'PUT',
      body: JSON.stringify({ status: 'rejected' }),
    })
    const res = await PUT(req, { params: { id: 'offer-1' } })

    expect(res.status).toBe(409)
    expect(mockedEmitNotification).not.toHaveBeenCalled()
  })
})
