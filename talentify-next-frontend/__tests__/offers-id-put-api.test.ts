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
  })

  it('returns 404 when offer does not exist', async () => {
    mockedGetCurrentUser.mockResolvedValue({ user: { id: 'u1' }, error: null })
    mockedFindOfferAccessById.mockResolvedValue(null)

    const req = new NextRequest('http://localhost/api/offers/offer-404', {
      method: 'PUT',
      body: JSON.stringify({ status: 'approved' }),
    })
    const res = await PUT(req, { params: { id: 'offer-404' } })

    expect(res.status).toBe(404)
    await expect(res.json()).resolves.toMatchObject({ error: 'オファーが見つかりません' })
    expect(mockedUpdateOfferById).not.toHaveBeenCalled()
  })

  it('returns 403 when user is not store/talent owner', async () => {
    mockedGetCurrentUser.mockResolvedValue({ user: { id: 'u-other' }, error: null })
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
    expect(mockedUpdateOfferById).not.toHaveBeenCalled()
  })

  it('returns 400 when no updatable fields are provided', async () => {
    mockedGetCurrentUser.mockResolvedValue({ user: { id: 'u-store' }, error: null })
    mockedFindOfferAccessById.mockResolvedValue({
      store_user_id: 'u-store',
      talent_user_id: 'u-talent',
    })

    const req = new NextRequest('http://localhost/api/offers/offer-1', {
      method: 'PUT',
      body: JSON.stringify({ message: 'not-allowed' }),
    })
    const res = await PUT(req, { params: { id: 'offer-1' } })

    expect(res.status).toBe(400)
    await expect(res.json()).resolves.toMatchObject({ error: '更新可能な項目がありません' })
    expect(mockedUpdateOfferById).not.toHaveBeenCalled()
  })

  it('updates allowed fields for store owner', async () => {
    mockedGetCurrentUser.mockResolvedValue({ user: { id: 'u-store' }, error: null })
    mockedUpdateOfferById.mockResolvedValue(1)
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
    expect(mockedUpdateOfferById).toHaveBeenCalledWith('offer-1', {
      contract_url: 'https://example.com/contract',
    })
  })

  it('updates allowed fields for talent owner', async () => {
    mockedGetCurrentUser.mockResolvedValue({ user: { id: 'u-talent' }, error: null })
    mockedUpdateOfferById.mockResolvedValue(1)
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
    expect(mockedUpdateOfferById).toHaveBeenCalledWith('offer-1', { agreed: true })
  })

  it('normalizes status before updating', async () => {
    mockedGetCurrentUser.mockResolvedValue({ user: { id: 'u-store' }, error: null })
    mockedUpdateOfferById.mockResolvedValue(1)
    mockedFindOfferAccessById.mockResolvedValue({
      store_user_id: 'u-store',
      talent_user_id: 'u-talent',
    })

    const req = new NextRequest('http://localhost/api/offers/offer-1', {
      method: 'PUT',
      body: JSON.stringify({ status: 'Cancelled' }),
    })
    const res = await PUT(req, { params: { id: 'offer-1' } })

    expect(res.status).toBe(200)
    expect(mockedUpdateOfferById).toHaveBeenCalledWith('offer-1', { status: 'canceled' })
    expect(mockedEmitNotification).toHaveBeenCalled()
  })
})
